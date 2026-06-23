import { useEffect, useRef, useState } from 'react';
import { Sparkles, ArrowRight, ChevronLeft, Check, Target, MessageCircle, CircleCheck, Circle, LogOut, Bell, BellRing } from 'lucide-react';
import { T, space, sportById } from '../lib/sports';
import { getBrand } from '../lib/brands';
import { fmtFullDate, relativeDate } from '../lib/format';
import { findAthleteByCode } from '../data/store';
import { useBrand } from '../auth/BrandContext';
import { ensureNotifyPermission, notifyPermission, showLocalNotification } from '../lib/notify';
import ProgressChart from './ProgressChart';
import RecapThread from './RecapThread';
import HomeworkBlock from './HomeworkBlock';

const CODE_KEY = 'coachcast.familycode';

export default function FamilyPortal() {
  const { clearBrand } = useBrand();
  const [entry, setEntry] = useState(() => {
    try {
      const c = sessionStorage.getItem(CODE_KEY);
      return c ? findAthleteByCode(c) : null;
    } catch {
      return null;
    }
  });

  // Re-resolve the athlete from storage (after a family write, or a cross-tab change
  // when the coach sends/replies in another window).
  const refresh = () => {
    try {
      const c = sessionStorage.getItem(CODE_KEY);
      if (!c) return;
      const found = findAthleteByCode(c);
      if (found) setEntry(found);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const onChild = (found, code) => {
    try {
      sessionStorage.setItem(CODE_KEY, code);
    } catch {
      // ignore
    }
    setEntry(found);
  };
  const changeChild = () => {
    try {
      sessionStorage.removeItem(CODE_KEY);
    } catch {
      // ignore
    }
    setEntry(null);
  };

  if (entry) return <FamilyView entry={entry} onChange={changeChild} onExit={clearBrand} onRefresh={refresh} />;
  return <FamilyEntry onFound={onChild} onExit={clearBrand} />;
}

function FamilyEntry({ onFound, onExit }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const found = findAthleteByCode(code);
    if (!found) {
      setError("We couldn't find that code. Check it with your coach or tutor.");
      return;
    }
    onFound(found, code.trim().toUpperCase());
  };

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, display: 'grid', placeItems: 'center', padding: '32px 22px' }}>
      <form onSubmit={submit} className="cc-anim-up" style={{ width: '100%', maxWidth: 400 }}>
        <button type="button" onClick={onExit} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: T.ink40, marginBottom: 20, marginLeft: -4 }}>
          <ChevronLeft size={16} /> Back
        </button>

        <div style={{ width: 44, height: 44, borderRadius: 13, background: T.accent, display: 'grid', placeItems: 'center', color: '#fff', marginBottom: 16, boxShadow: `0 8px 18px -8px ${T.accentGlow}` }}>
          <Sparkles size={22} />
        </div>
        <h1 style={{ fontFamily: space.display, fontWeight: 700, fontSize: 30, letterSpacing: '-.02em', color: T.ink, marginBottom: 8 }}>
          See your child's progress
        </h1>
        <p style={{ fontSize: 15, color: T.ink70, lineHeight: 1.55, marginBottom: 24 }}>
          Enter the code your coach or tutor shared with you to view recaps, homework, and goals.
        </p>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.ink70, marginBottom: 6 }}>Family code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="e.g. MAYA-4823"
          autoCapitalize="characters"
          style={{ width: '100%', padding: '13px 14px', borderRadius: T.rSm, border: `1.5px solid ${T.line}`, background: T.surface, fontSize: 16, letterSpacing: '.02em', textTransform: 'uppercase' }}
          onFocus={(e) => (e.target.style.borderColor = T.accent)}
          onBlur={(e) => (e.target.style.borderColor = T.line)}
        />
        {error && <div role="alert" style={{ color: T.accentText, fontSize: 13.5, fontWeight: 600, marginTop: 10 }}>{error}</div>}

        <button
          type="submit"
          style={{ width: '100%', marginTop: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 18px', borderRadius: T.r, background: T.accent, color: '#fff', fontWeight: 600, fontSize: 15, boxShadow: `0 2px 8px -3px ${T.accentGlow}` }}
        >
          View progress
          <ArrowRight size={17} strokeWidth={2.5} />
        </button>

        <div style={{ marginTop: 18, fontSize: 12.5, color: T.ink40, lineHeight: 1.5 }}>
          This is a read-only view for parents and students. On this demo it works for codes on this device; cross-device sharing arrives with accounts.
        </div>
      </form>
    </div>
  );
}

function ROGoal({ goal }) {
  const done = !!goal.achievedAt;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 2px' }}>
      <span style={{ display: 'grid', placeItems: 'center', flexShrink: 0, color: done ? T.accent : T.ink40 }}>
        {done ? <CircleCheck size={18} strokeWidth={2.25} /> : <Circle size={18} strokeWidth={2} />}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: done ? T.ink40 : T.ink, textDecoration: done ? 'line-through' : 'none' }}>{goal.text}</div>
        {done && <div style={{ fontSize: 11.5, color: T.ink40 }}>Achieved {relativeDate(goal.achievedAt)}</div>}
      </div>
    </div>
  );
}

function ROTag({ icon, items }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {items.map((t, i) => (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: T.ink70, background: T.surfaceAlt, border: `1px solid ${T.line}`, borderRadius: 999, padding: '4px 9px' }}>
          {icon}
          {t}
        </span>
      ))}
    </div>
  );
}

function FamilyView({ entry, onChange, onExit, onRefresh }) {
  const { athlete, mode } = entry;
  const brand = getBrand(mode);
  const s = sportById(athlete.sport);
  const Icon = s.Icon;
  const first = athlete.name.split(' ')[0];
  const coachLabel = mode === 'tutor' ? 'Tutor' : 'Coach';
  const recaps = athlete.recaps.filter((r) => r.sent !== false);
  const goals = athlete.goals || [];

  // Notifications opt-in. Fires a local notification when a new recap arrives while
  // the portal is open (e.g. the coach sends from another window).
  const [perm, setPerm] = useState(() => notifyPermission());
  const notifyOn = perm === 'granted';
  const enableNotify = async () => setPerm(await ensureNotifyPermission());

  const idsKey = recaps.map((r) => r.id).join(',');
  const seen = useRef(null);
  useEffect(() => {
    const ids = recaps.map((r) => r.id);
    if (seen.current === null) {
      seen.current = new Set(ids);
      return;
    }
    const fresh = ids.filter((id) => !seen.current.has(id));
    fresh.forEach((id) => seen.current.add(id));
    if (notifyOn && fresh.length) {
      const r = recaps.find((x) => x.id === fresh[0]);
      showLocalNotification(`New update for ${first}`, r?.headline || 'New progress update');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, notifyOn]);

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: T.bg }}>
      {/* top bar */}
      <header style={{ height: 62, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px, 4vw, 32px)', borderBottom: `1px solid ${T.line}`, background: 'rgba(246,241,234,.82)', backdropFilter: 'saturate(140%) blur(10px)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
          <span style={{ width: 28, height: 28, borderRadius: 9, background: T.accent, display: 'grid', placeItems: 'center', color: '#fff' }}>
            <Sparkles size={16} />
          </span>
          <span style={{ fontFamily: space.display, fontWeight: 700, fontSize: 18, letterSpacing: '-.01em', color: T.ink }}>{athlete.name.split(' ')[0]}'s progress</span>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
          {perm !== 'unsupported' && (
            <button
              onClick={enableNotify}
              title={notifyOn ? 'Update alerts are on' : perm === 'denied' ? 'Alerts blocked in browser settings' : 'Get notified of new updates'}
              aria-label="Notifications"
              style={{ display: 'inline-flex', alignItems: 'center', color: notifyOn ? T.accentText : T.ink70 }}
            >
              {notifyOn ? <BellRing size={16} strokeWidth={2.25} /> : <Bell size={16} strokeWidth={2.25} />}
            </button>
          )}
          <button onClick={onChange} style={{ fontSize: 13, fontWeight: 600, color: T.ink70 }}>Change code</button>
          <button onClick={onExit} title="Exit" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: T.ink70 }}>
            <LogOut size={16} /> Exit
          </button>
        </div>
      </header>

      <div className="cc-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
        <div className="cc-anim-slide" style={{ width: '100%', maxWidth: 640, padding: '22px clamp(16px,4vw,24px) 40px' }}>
          {/* athlete header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <span style={{ width: 52, height: 52, borderRadius: '50%', background: T.accentSoft, color: T.accentText, display: 'grid', placeItems: 'center', fontFamily: space.display, fontWeight: 700, fontSize: 19 }}>
              {athlete.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
            </span>
            <div>
              <h2 style={{ fontFamily: space.display, fontWeight: 700, fontSize: 23, letterSpacing: '-.02em' }}>{athlete.name}</h2>
              <div style={{ fontSize: 13, color: T.ink40, display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Icon size={13} color={T.accent} strokeWidth={2.25} /> {s.label} · Age {athlete.age}
              </div>
            </div>
          </div>

          <ProgressChart athlete={athlete} />

          {/* goals */}
          {goals.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.ink40, marginBottom: 6 }}>Goals</div>
              {goals.filter((g) => !g.achievedAt).map((g) => <ROGoal key={g.id} goal={g} />)}
              {goals.filter((g) => g.achievedAt).map((g) => <ROGoal key={g.id} goal={g} />)}
            </div>
          )}

          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.ink40, marginBottom: 10 }}>Updates from your {mode === 'tutor' ? 'tutor' : 'coach'}</div>

          {recaps.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', color: T.ink40, fontSize: 14, border: `1px dashed ${T.lineStrong}`, borderRadius: T.r }}>
              No updates yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {recaps.map((r) => (
                <div key={r.id} style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: T.r, padding: 15, boxShadow: T.shadowSoft }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.ink40 }}>{fmtFullDate(r.createdAt)}</div>
                  <h3 style={{ fontFamily: space.display, fontWeight: 700, fontSize: 18, letterSpacing: '-.01em', margin: '4px 0 0' }}>{r.headline}</h3>
                  <ROTag icon={<Check size={11} strokeWidth={3} color={T.accent} />} items={r.workedOn} />
                  <ROTag icon={<Target size={11} strokeWidth={2.5} color={T.accent} />} items={r.nextFocus} />
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line}`, display: 'flex', gap: 8 }}>
                    <MessageCircle size={14} color={T.ink40} style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 13.5, lineHeight: 1.55, color: T.ink70 }}>{r.parentMessage}</p>
                  </div>
                  <HomeworkBlock recap={r} brand={brand} />
                  {r.photo && (
                    <img src={r.photo} alt="Session attachment" style={{ width: '100%', borderRadius: T.rSm, marginTop: 10, display: 'block', border: `1px solid ${T.line}` }} />
                  )}
                  <RecapThread mode={mode} athleteId={athlete.id} recap={r} role="family" coachLabel={coachLabel} onChange={onRefresh} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
