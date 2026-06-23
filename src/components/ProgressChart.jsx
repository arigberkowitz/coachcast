import { T, space } from '../lib/sports';
import { isSent, weekStreak, weeklySessionCounts } from '../lib/selectors';
import { Eyebrow } from './ui';

// A light, dependency-free progress view: sessions per week (last 8 weeks) plus a
// few motivating totals. Shared by the coach's athlete page and the family portal,
// so the kid sees their own momentum too.
export default function ProgressChart({ athlete }) {
  const sent = (athlete.recaps || []).filter(isSent);
  const goals = athlete.goals || [];
  const goalsReached = goals.filter((g) => g.achievedAt).length;
  const streak = weekStreak([athlete]);
  const weeks = weeklySessionCounts(athlete, 8);
  const max = Math.max(1, ...weeks.map((w) => w.count));

  return (
    <div style={{ border: `1px solid ${T.line}`, background: T.surface, borderRadius: T.r, padding: 15, marginBottom: 18, boxShadow: T.shadowSoft }}>
      <Eyebrow style={{ marginBottom: 11 }}>Progress</Eyebrow>

      <div style={{ display: 'flex', gap: 8, marginBottom: 15 }}>
        <Tile value={sent.length} label={sent.length === 1 ? 'session' : 'sessions'} />
        <Tile value={goalsReached} label={goalsReached === 1 ? 'goal reached' : 'goals reached'} />
        <Tile value={streak} label="week streak" />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 76 }}>
        {weeks.map((w, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%' }} title={`${w.count} ${w.count === 1 ? 'session' : 'sessions'} · week of ${w.label}`}>
            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
              <div
                style={{
                  width: '100%',
                  height: `${w.count ? Math.max(10, (w.count / max) * 100) : 3}%`,
                  minHeight: w.count ? 6 : 2,
                  background: w.count ? T.accent : T.line,
                  borderRadius: '5px 5px 2px 2px',
                  transition: 'height .35s cubic-bezier(.22,.8,.3,1)',
                }}
              />
            </div>
            <div style={{ fontSize: 9.5, color: i === weeks.length - 1 ? T.accentText : T.ink40, fontWeight: i === weeks.length - 1 ? 700 : 400 }}>
              {i === weeks.length - 1 ? 'now' : w.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tile({ value, label }) {
  return (
    <div style={{ flex: 1, background: T.surfaceAlt, border: `1px solid ${T.line}`, borderRadius: T.rSm, padding: '9px 10px' }}>
      <div style={{ fontFamily: space.display, fontWeight: 700, fontSize: 21, lineHeight: 1, letterSpacing: '-.02em', color: T.ink }}>{value}</div>
      <div style={{ fontSize: 11, color: T.ink40, marginTop: 4 }}>{label}</div>
    </div>
  );
}
