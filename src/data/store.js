// Data seam, mode-aware. Each brand (coach/tutor) has its own localStorage key and
// seed, so a coach never sees students and vice-versa. The active mode is set when
// a side is chosen. Every read/write lives here — a future per-coach database swap
// touches only this file.
import { useSyncExternalStore } from 'react';
import { getBrand } from '../lib/brands';
import { athleteCode } from '../lib/format';

const BRAND_KEY = 'coachcast.brand'; // shared with BrandContext

const uid = () =>
  (globalThis.crypto?.randomUUID?.() ??
    `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`);

let mode = null;
let state = { athletes: [] };
const listeners = new Set();

function load(m) {
  const brand = getBrand(m);
  try {
    const raw = localStorage.getItem(brand.storeKey);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore — fall through to seed
  }
  return { athletes: brand.seed };
}

function persist() {
  if (!mode) return;
  try {
    localStorage.setItem(getBrand(mode).storeKey, JSON.stringify(state));
  } catch {
    // storage unavailable — in-memory for this session
  }
}

function setState(next) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

// initialise from the persisted side (covers a reload straight into the app)
try {
  const m = sessionStorage.getItem(BRAND_KEY);
  if (m) {
    mode = m;
    state = load(m);
  }
} catch {
  // ignore
}

export function setMode(m) {
  if (m === mode) return;
  mode = m;
  state = load(m);
  listeners.forEach((l) => l());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

// ---- public API (the seam) ----

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function getAthlete(id) {
  return state.athletes.find((a) => a.id === id) || null;
}

export function saveRecap(athleteId, recap) {
  const full = {
    id: recap.id ?? uid(),
    athleteId,
    createdAt: recap.createdAt ?? new Date().toISOString(),
    sent: true,
    ...recap,
  };
  setState({
    ...state,
    athletes: state.athletes.map((a) =>
      a.id === athleteId ? { ...a, recaps: [full, ...a.recaps] } : a,
    ),
  });
  return full;
}

export function addAthlete({ name, age, sport, parentEmail = '' }) {
  const a = { id: uid(), name: name.trim(), age: Number(age), sport, parentEmail: parentEmail.trim(), recaps: [] };
  setState({ ...state, athletes: [...state.athletes, a] });
  return a;
}

export function updateRecap(athleteId, recapId, patch) {
  let updated = null;
  setState({
    ...state,
    athletes: state.athletes.map((a) =>
      a.id !== athleteId
        ? a
        : {
            ...a,
            recaps: a.recaps.map((r) => {
              if (r.id !== recapId) return r;
              updated = { ...r, ...patch };
              return updated;
            }),
          },
    ),
  });
  return updated;
}

export function updateAthlete(id, patch) {
  let updated = null;
  setState({
    ...state,
    athletes: state.athletes.map((a) => {
      if (a.id !== id) return a;
      updated = {
        ...a,
        ...patch,
        name: patch.name != null ? String(patch.name).trim() : a.name,
        age: patch.age != null ? Number(patch.age) : a.age,
      };
      return updated;
    }),
  });
  return updated;
}

export function deleteAthlete(id) {
  setState({ ...state, athletes: state.athletes.filter((a) => a.id !== id) });
}

export function addGoal(athleteId, text) {
  const g = { id: uid(), text: text.trim(), createdAt: new Date().toISOString(), achievedAt: null };
  setState({
    ...state,
    athletes: state.athletes.map((a) => (a.id !== athleteId ? a : { ...a, goals: [...(a.goals || []), g] })),
  });
  return g;
}

export function toggleGoal(athleteId, goalId) {
  setState({
    ...state,
    athletes: state.athletes.map((a) =>
      a.id !== athleteId
        ? a
        : {
            ...a,
            goals: (a.goals || []).map((g) =>
              g.id !== goalId ? g : { ...g, achievedAt: g.achievedAt ? null : new Date().toISOString() },
            ),
          },
    ),
  });
}

export function deleteGoal(athleteId, goalId) {
  setState({
    ...state,
    athletes: state.athletes.map((a) =>
      a.id !== athleteId ? a : { ...a, goals: (a.goals || []).filter((g) => g.id !== goalId) },
    ),
  });
}

export function deleteRecap(athleteId, recapId) {
  setState({
    ...state,
    athletes: state.athletes.map((a) =>
      a.id !== athleteId ? a : { ...a, recaps: a.recaps.filter((r) => r.id !== recapId) },
    ),
  });
}

export function resetStore() {
  if (mode) setState({ athletes: getBrand(mode).seed });
}

// ---- read-only, cross-dataset lookup for the family portal ----
// Reads a side's data without changing the active mode (coach & tutor each have
// their own dataset). Cross-device sharing is a Phase-2 (database) upgrade; today
// this resolves against whatever's on this device.
function readDataset(m) {
  const brand = getBrand(m);
  try {
    const raw = localStorage.getItem(brand.storeKey);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { athletes: brand.seed };
}

export function findAthleteByCode(code) {
  const wanted = String(code || '').trim().toUpperCase();
  if (!wanted) return null;
  for (const m of ['coach', 'tutor']) {
    const data = readDataset(m);
    const athlete = data.athletes.find((a) => athleteCode(a) === wanted);
    if (athlete) return { athlete, mode: m };
  }
  return null;
}

// ---- two-way loop: reactions + per-recap message threads ----
// These write to a SPECIFIC side's dataset (the family portal acts on coach/tutor
// data while a different side may be the active mode), persist to that side's key,
// and notify only if it's the active mode. Same localStorage keys = both sides see
// each other on one device. This is the seam that later swaps to a cloud DB.
function mutateDataset(targetMode, fn, shouldCommit) {
  const isActive = targetMode === mode;
  const data = isActive ? state : readDataset(targetMode);
  const next = fn(data);
  if (shouldCommit && !shouldCommit()) return data;
  try {
    localStorage.setItem(getBrand(targetMode).storeKey, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
  if (isActive) {
    state = next;
    listeners.forEach((l) => l());
  }
  return next;
}

function mapRecap(data, athleteId, recapId, fn) {
  return {
    ...data,
    athletes: data.athletes.map((a) =>
      a.id !== athleteId ? a : { ...a, recaps: a.recaps.map((r) => (r.id !== recapId ? r : fn(r))) },
    ),
  };
}

export function setRecapReaction(targetMode, athleteId, recapId, emoji) {
  return mutateDataset(targetMode, (data) =>
    mapRecap(data, athleteId, recapId, (r) => ({ ...r, reaction: r.reaction === emoji ? null : emoji })),
  );
}

export function addThreadMessage(targetMode, athleteId, recapId, { from, text }) {
  const msg = {
    id: uid(),
    from, // 'coach' | 'family'
    text: String(text).trim(),
    createdAt: new Date().toISOString(),
    readByCoach: from === 'coach',
    readByFamily: from === 'family',
  };
  mutateDataset(targetMode, (data) =>
    mapRecap(data, athleteId, recapId, (r) => ({ ...r, thread: [...(r.thread || []), msg] })),
  );
  return msg;
}

// role 'coach' marks the family's messages read; 'family' marks the coach's. No-op
// (no persist/notify) when nothing is unread, so it's safe to call from an effect.
export function markThreadRead(targetMode, athleteId, recapId, role) {
  const key = role === 'coach' ? 'readByCoach' : 'readByFamily';
  const otherFrom = role === 'coach' ? 'family' : 'coach';
  let changed = false;
  mutateDataset(
    targetMode,
    (data) =>
      mapRecap(data, athleteId, recapId, (r) => {
        if (!r.thread?.some((m) => m.from === otherFrom && !m[key])) return r;
        changed = true;
        return { ...r, thread: r.thread.map((m) => (m.from === otherFrom && !m[key] ? { ...m, [key]: true } : m)) };
      }),
    () => changed,
  );
  return changed;
}

// Cross-tab sync: when another tab writes the active side's dataset (e.g. the family
// reacts in one window while the coach watches in another), refresh + notify live.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!mode || !e.key) return;
    if (e.key === getBrand(mode).storeKey) {
      state = load(mode);
      listeners.forEach((l) => l());
    }
  });
}
