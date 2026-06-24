import { useState } from 'react';
import { Mic, Flame, ChevronRight, CircleCheck, Clock, ArrowRight, MessageSquare } from 'lucide-react';
import { T, space, sportById } from '../lib/sports';
import { useStore } from '../data/store';
import { useAuth } from '../auth/AuthContext';
import { useBrand } from '../auth/BrandContext';
import { relativeDate, fmtDate } from '../lib/format';
import { useCountUp } from '../lib/useCountUp';
import {
  recapsThisWeek,
  athletesRecappedThisWeek,
  weekStreak,
  dueAthletes,
  recentRecaps,
  awaitingReply,
  upcomingSessions,
  paymentsDue,
  DUE_DAYS,
} from '../lib/selectors';
import { Avatar, Eyebrow } from './ui';
import Screen from './Screen';
import AthletePicker from './AthletePicker';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function Metric({ value, label, icon }) {
  const display = useCountUp(value);
  return (
    <div style={{ flex: 1, background: T.surfaceAlt, border: `1px solid ${T.line}`, borderRadius: T.r, padding: '12px 12px 11px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: T.accent, marginBottom: 5 }}>{icon}</div>
      <div style={{ fontFamily: space.display, fontWeight: 700, fontSize: 24, lineHeight: 1, letterSpacing: '-.02em', color: T.ink }}>
        {display}
      </div>
      <div style={{ fontSize: 11.5, color: T.ink40, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function DueRow({ athlete, lastTs, onNewRecap }) {
  const s = sportById(athlete.sport);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 11,
        borderRadius: T.r,
        background: T.surface,
        border: `1px solid ${T.line}`,
        boxShadow: T.shadowSoft,
      }}
    >
      <Avatar name={athlete.name} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14.5 }}>{athlete.name}</span>
          <s.Icon size={12} color={T.accent} strokeWidth={2.25} />
        </div>
        <div style={{ fontSize: 12, color: lastTs === null ? T.accentText : T.ink40, fontWeight: lastTs === null ? 600 : 400 }}>
          {lastTs === null ? 'No recaps yet' : `Last recap ${relativeDate(new Date(lastTs).toISOString()).toLowerCase()}`}
        </div>
      </div>
      <button
        onClick={onNewRecap}
        aria-label={`New recap for ${athlete.name}`}
        title="New recap"
        style={{ width: 38, height: 38, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 11, background: T.accent, color: '#fff', boxShadow: `0 6px 14px -7px ${T.accentGlow}` }}
      >
        <Mic size={17} strokeWidth={2.25} />
      </button>
    </div>
  );
}

function RecentRow({ recap, onOpen }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px', cursor: 'pointer', borderRadius: T.rSm }}
    >
      <Avatar name={recap.athlete.name} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: T.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {recap.headline}
        </div>
        <div style={{ fontSize: 12, color: T.ink40 }}>
          {recap.athlete.name.split(' ')[0]} · {relativeDate(recap.createdAt)}
        </div>
      </div>
      <ChevronRight size={17} color={T.ink40} style={{ flexShrink: 0 }} />
    </div>
  );
}

function BizRow({ athlete, sub, right, accent, onClick }) {
  const s = sportById(athlete.sport);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick())}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 11, borderRadius: T.r, background: T.surface, border: `1px solid ${T.line}`, boxShadow: T.shadowSoft, cursor: 'pointer' }}
    >
      <Avatar name={athlete.name} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14.5 }}>{athlete.name}</span>
          <s.Icon size={12} color={T.accent} strokeWidth={2.25} />
        </div>
        <div style={{ fontSize: 12, color: T.ink40 }}>{sub}</div>
      </div>
      <span style={{ fontSize: 13.5, fontWeight: 700, color: accent ? T.accentText : T.ink, flexShrink: 0 }}>{right}</span>
      <ChevronRight size={17} color={T.ink40} style={{ flexShrink: 0 }} />
    </div>
  );
}

export default function Today({ onNewRecap, onOpenAthlete }) {
  const { athletes } = useStore();
  const { user } = useAuth();
  const { brand } = useBrand();
  const [picking, setPicking] = useState(false);

  const due = dueAthletes(athletes);
  const recent = recentRecaps(athletes, 6);
  const week = recapsThisWeek(athletes);
  const streak = weekStreak(athletes);
  const waiting = awaitingReply(athletes);
  const upcoming = upcomingSessions(athletes);
  const duePay = paymentsDue(athletes);

  return (
    <Screen title="">
      {/* greeting hero */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: space.display, fontWeight: 700, fontSize: 26, letterSpacing: '-.025em', color: T.ink, lineHeight: 1.1 }}>
          {greeting()}, {user.name.split(' ')[0]}.
        </div>
        <div style={{ fontSize: 14, color: T.ink40, marginTop: 3 }}>Here's where things stand.</div>
      </div>

      {/* quick new recap */}
      <button
        className="cc-sheen"
        onClick={() => setPicking(true)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 13,
          textAlign: 'left',
          padding: 15,
          borderRadius: T.rLg,
          background: T.accent,
          color: '#fff',
          boxShadow: `0 6px 16px -8px ${T.accentGlow}`,
          transition: 'transform .12s ease',
          marginBottom: 20,
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(.99)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'none')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
      >
        <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 14, background: 'rgba(255,255,255,.2)', display: 'grid', placeItems: 'center' }}>
          <Mic size={22} strokeWidth={2.25} />
        </span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontFamily: space.display, fontWeight: 700, fontSize: 17 }}>New recap</span>
          <span style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.9)', marginTop: 1 }}>
            Pick {/^[aeiou]/i.test(brand.person) ? 'an' : 'a'} {brand.person} and talk for 20 seconds.
          </span>
        </span>
        <ArrowRight size={20} strokeWidth={2.25} />
      </button>

      {/* this week */}
      <Eyebrow style={{ marginBottom: 8 }}>This week</Eyebrow>
      <div style={{ display: 'flex', gap: 9, marginBottom: 22 }}>
        <Metric value={week} label={week === 1 ? 'recap sent' : 'recaps sent'} icon={<Mic size={15} strokeWidth={2.25} />} />
        <Metric value={athletesRecappedThisWeek(athletes)} label={brand.personPlural.toLowerCase()} icon={<CircleCheck size={15} strokeWidth={2.25} />} />
        <Metric value={streak} label="week streak" icon={<Flame size={15} strokeWidth={2.25} className={streak > 0 ? 'cc-flicker' : undefined} />} />
      </div>

      {/* parents waiting on a reply */}
      {waiting.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <Eyebrow style={{ marginBottom: 8 }}>Parents waiting on you</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {waiting.slice(0, 4).map((r) => {
              const last = (r.thread || []).filter((m) => m.from === 'family').slice(-1)[0];
              const count = (r.thread || []).filter((m) => m.from === 'family' && !m.readByCoach).length;
              return (
                <button
                  key={r.id}
                  onClick={() => onOpenAthlete(r.athlete.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 11, borderRadius: T.r, background: T.accentSoft, border: `1px solid ${T.accentSoft2}`, textAlign: 'left' }}
                >
                  <Avatar name={r.athlete.name} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5, color: T.ink }}>
                      {r.athlete.name.split(' ')[0]} · new message
                    </div>
                    <div style={{ fontSize: 12, color: T.ink70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {last ? `“${last.text}”` : r.headline}
                    </div>
                  </div>
                  {count > 0 && (
                    <span style={{ flexShrink: 0, minWidth: 20, height: 20, padding: '0 6px', display: 'grid', placeItems: 'center', borderRadius: 999, background: T.accent, color: '#fff', fontSize: 11.5, fontWeight: 700 }}>
                      {count}
                    </span>
                  )}
                  <MessageSquare size={16} color={T.accentText} style={{ flexShrink: 0 }} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* payments due */}
      {duePay.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <Eyebrow style={{ marginBottom: 8 }}>Payments due</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {duePay.map((a) => (
              <BizRow
                key={a.id}
                athlete={a}
                sub={`${a.plan.total}-session package`}
                right={`$${a.plan.total * a.plan.rate}`}
                accent
                onClick={() => onOpenAthlete(a.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* upcoming sessions */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <Eyebrow style={{ marginBottom: 8 }}>Coming up</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {upcoming.map((a) => (
              <BizRow
                key={a.id}
                athlete={a}
                sub="Next session"
                right={fmtDate(`${a.nextSession}T00:00:00`)}
                onClick={() => onOpenAthlete(a.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* due for a recap */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Eyebrow>Due for a recap</Eyebrow>
        {due.length > 0 && (
          <span style={{ fontSize: 11.5, fontWeight: 700, color: T.accentText, background: T.accentSoft, borderRadius: 999, padding: '2px 8px' }}>
            {due.length}
          </span>
        )}
      </div>
      {due.length === 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 15px',
            borderRadius: T.r,
            background: T.surfaceAlt,
            border: `1px solid ${T.line}`,
            color: T.ink70,
            fontSize: 13.5,
            marginBottom: 22,
          }}
        >
          <CircleCheck size={18} color={T.accent} strokeWidth={2.25} style={{ flexShrink: 0 }} />
          All caught up — everyone has a recap from the last {DUE_DAYS} days.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 22 }}>
          {due.map(({ athlete, lastTs }) => (
            <DueRow key={athlete.id} athlete={athlete} lastTs={lastTs} onNewRecap={() => onNewRecap(athlete.id)} />
          ))}
        </div>
      )}

      {/* recent activity */}
      <Eyebrow style={{ marginBottom: 4 }}>Recent activity</Eyebrow>
      {recent.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: T.ink40, fontSize: 13.5, padding: '12px 4px' }}>
          <Clock size={15} /> No recaps yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recent.map((r, i) => (
            <div key={r.id} style={i > 0 ? { borderTop: `1px solid ${T.line}` } : undefined}>
              <RecentRow recap={r} onOpen={() => onOpenAthlete(r.athlete.id)} />
            </div>
          ))}
        </div>
      )}

      {picking && (
        <AthletePicker
          onClose={() => setPicking(false)}
          onPick={(id) => {
            setPicking(false);
            onNewRecap(id);
          }}
        />
      )}
    </Screen>
  );
}
