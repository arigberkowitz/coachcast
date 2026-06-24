import { useState } from 'react';
import { CreditCard, Calendar, Check, Share2, Pencil, RefreshCw, X } from 'lucide-react';
import { T, space } from '../lib/sports';
import { updateAthlete } from '../data/store';
import { sessionsUsed, planRemaining } from '../lib/selectors';
import { fmtFullDate } from '../lib/format';
import { useCopy } from '../lib/useCopy';
import { Eyebrow } from './ui';

const field = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: T.rSm,
  border: `1.5px solid ${T.line}`,
  background: T.surface,
  fontSize: 14,
  color: T.ink,
  outline: 'none',
};

// Coaching business layer: track a session package, its payment status, and the
// next booked session. Tracking + nudges only — no real money moves here (that's a
// payment-processor / Phase-2 add). "Sessions used" mirrors recaps sent.
export default function BillingCard({ athlete }) {
  const { copied, copy } = useCopy();
  const plan = athlete.plan;
  const used = sessionsUsed(athlete);
  const remaining = planRemaining(athlete);
  const first = athlete.name.split(' ')[0];

  const [editing, setEditing] = useState(false);
  const [total, setTotal] = useState(String(plan?.total || 8));
  const [rate, setRate] = useState(String(plan?.rate || 40));

  const savePlan = () => {
    const t = Math.max(1, parseInt(total, 10) || 0);
    const r = Math.max(0, parseInt(rate, 10) || 0);
    updateAthlete(athlete.id, { plan: { total: t, rate: r, paid: plan?.paid || false } });
    setEditing(false);
  };

  const setPaid = (paid) => updateAthlete(athlete.id, { plan: { ...plan, paid } });

  const requestPayment = async () => {
    const amount = plan.total * plan.rate;
    const msg = `Hi! Quick note on ${first}'s sessions — the ${plan.total}-session package comes to $${amount}. Whenever it's convenient, let me know the easiest way to settle up. Thank you!`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${first}'s sessions`, text: msg });
        return;
      }
    } catch {
      // user dismissed share — fall through to copy
    }
    copy(msg);
  };

  const renew = () => updateAthlete(athlete.id, { plan: { ...plan, total: plan.total + plan.total, paid: false } });

  return (
    <div style={{ border: `1px solid ${T.line}`, background: T.surface, borderRadius: T.r, padding: 15, marginBottom: 18, boxShadow: T.shadowSoft }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 }}>
        <Eyebrow>Sessions &amp; payment</Eyebrow>
        {plan && !editing && (
          <button onClick={() => setEditing(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: T.ink70 }}>
            <Pencil size={13} strokeWidth={2.25} /> Edit
          </button>
        )}
      </div>

      {!plan && !editing && (
        <button
          onClick={() => setEditing(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '11px 13px', borderRadius: T.rSm, border: `1.5px dashed ${T.lineStrong}`, color: T.ink70, fontSize: 14, fontWeight: 600 }}
        >
          <CreditCard size={17} strokeWidth={2.25} color={T.accent} />
          Set up a session package
        </button>
      )}

      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <div style={{ display: 'flex', gap: 9 }}>
            <label style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 12, color: T.ink40, marginBottom: 4 }}>Sessions in package</span>
              <input value={total} inputMode="numeric" onChange={(e) => setTotal(e.target.value.replace(/[^0-9]/g, ''))} style={field} />
            </label>
            <label style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: 12, color: T.ink40, marginBottom: 4 }}>Rate per session ($)</span>
              <input value={rate} inputMode="numeric" onChange={(e) => setRate(e.target.value.replace(/[^0-9]/g, ''))} style={field} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 9 }}>
            <button onClick={savePlan} style={{ flex: 1, padding: '10px', borderRadius: T.rSm, background: T.accent, color: '#fff', fontWeight: 600, fontSize: 14 }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ padding: '10px 14px', borderRadius: T.rSm, background: T.surfaceAlt, border: `1px solid ${T.line}`, color: T.ink70, fontWeight: 600, fontSize: 14 }}>Cancel</button>
          </div>
        </div>
      )}

      {plan && !editing && (
        <>
          {/* progress */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 14, color: T.ink }}>
              <strong style={{ fontFamily: space.display, fontWeight: 700 }}>{used}</strong> of {plan.total} sessions used
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: remaining === 0 ? '#B23B2E' : T.ink40 }}>
              {remaining} left
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 999, background: T.surfaceAlt, overflow: 'hidden', border: `1px solid ${T.line}` }}>
            <div style={{ height: '100%', width: `${Math.min(100, (used / plan.total) * 100)}%`, background: T.accent, borderRadius: 999, transition: 'width .35s ease' }} />
          </div>

          {/* money + paid status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <span style={{ fontSize: 13.5, color: T.ink70 }}>
              {plan.total} × ${plan.rate} = <strong style={{ color: T.ink, fontWeight: 700 }}>${plan.total * plan.rate}</strong>
            </span>
            {plan.paid ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#1E6E55', background: '#DCF2EA', borderRadius: 999, padding: '3px 10px' }}>
                <Check size={12} strokeWidth={3} /> Paid
              </span>
            ) : (
              <span style={{ fontSize: 12, fontWeight: 700, color: '#8A5A07', background: '#FCE9C4', borderRadius: 999, padding: '3px 10px' }}>Unpaid</span>
            )}
          </div>

          {/* renew nudge */}
          {remaining <= 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '9px 11px', borderRadius: T.rSm, background: T.accentSoft, color: T.accentText, fontSize: 12.5, fontWeight: 600 }}>
              <RefreshCw size={14} strokeWidth={2.25} style={{ flexShrink: 0 }} />
              {remaining === 0 ? `${first}'s package is used up.` : `Only 1 session left for ${first}.`}
              <button onClick={renew} style={{ marginLeft: 'auto', fontWeight: 700, color: T.accentText, textDecoration: 'underline' }}>Renew</button>
            </div>
          )}

          {/* actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {plan.paid ? (
              <button onClick={() => setPaid(false)} style={btn(false)}>Mark unpaid</button>
            ) : (
              <button onClick={() => setPaid(true)} style={btn(true)}>
                <Check size={14} strokeWidth={2.5} /> Mark paid
              </button>
            )}
            {!plan.paid && (
              <button onClick={requestPayment} style={btn(false)}>
                {copied ? <Check size={14} strokeWidth={2.5} color={T.accent} /> : <Share2 size={14} strokeWidth={2.25} />}
                {copied ? 'Copied' : 'Request payment'}
              </button>
            )}
          </div>
        </>
      )}

      {/* next session */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 14, paddingTop: 13, borderTop: `1px solid ${T.line}` }}>
        <Calendar size={16} strokeWidth={2.25} color={T.accent} style={{ flexShrink: 0 }} />
        {athlete.nextSession ? (
          <>
            <span style={{ fontSize: 13.5, color: T.ink }}>
              Next session <strong style={{ fontWeight: 700 }}>{fmtFullDate(`${athlete.nextSession}T00:00:00`)}</strong>
            </span>
            <button onClick={() => updateAthlete(athlete.id, { nextSession: '' })} aria-label="Clear next session" style={{ marginLeft: 'auto', color: T.ink40, display: 'grid', placeItems: 'center' }}>
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize: 13.5, color: T.ink70 }}>Book next session</span>
            <input
              type="date"
              onChange={(e) => e.target.value && updateAthlete(athlete.id, { nextSession: e.target.value })}
              style={{ marginLeft: 'auto', padding: '7px 10px', borderRadius: T.rSm, border: `1.5px solid ${T.line}`, background: T.surface, fontSize: 13, color: T.ink, outline: 'none' }}
            />
          </>
        )}
      </div>
    </div>
  );
}

function btn(primary) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 13px',
    borderRadius: T.rSm,
    fontSize: 13,
    fontWeight: 600,
    background: primary ? T.accent : T.surfaceAlt,
    border: primary ? 'none' : `1px solid ${T.line}`,
    color: primary ? '#fff' : T.ink70,
  };
}
