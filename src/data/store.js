// Data seam, mode-aware. Each brand (coach/tutor) has its own localStorage key and
// seed, so a coach never sees students and vice-versa. The active mode is set when
// a side is chosen. Every read/write lives here — a future per-coach database swap
// touches only this file.
import { useSyncExternalStore } from 'react';
import { getBrand } from '../lib/brands';

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

export function addAthlete({ name, age, sport }) {
  const a = { id: uid(), name: name.trim(), age: Number(age), sport, recaps: [] };
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
