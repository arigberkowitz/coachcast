import { useState } from 'react';
import { Check, Send, X, CheckCheck } from 'lucide-react';
import { T, space } from '../lib/sports';
import { saveRecap } from '../data/store';
import { useBrand } from '../auth/BrandContext';
import { Avatar, PrimaryButton } from './ui';
import Screen from './Screen';

export default function GroupReview({ group, draft, onBack, onDone }) {
  const { brand } = useBrand();
  const [items, setItems] = useState(() => draft.recaps.map((r) => ({ ...r, included: true })));
  const [sentCount, setSentCount] = useState(null);

  const update = (athleteId, patch) =>
    setItems((its) => its.map((it) => (it.athleteId === athleteId ? { ...it, ...patch } : it)));
  const included = items.filter((it) => it.included);

  const sendAll = () => {
    included.forEach((it) => {
      saveRecap(it.athleteId, {
        sport: draft.sport,
        tone: draft.tone,
        note: draft.note,
        headline: it.headline.trim(),
        workedOn: it.workedOn,
        improved: it.improved,
        nextFocus: it.nextFocus,
        homework: it.homework,
        homeworkHow: it.homeworkHow,
        parentMessage: it.parentMessage.trim(),
        language: 'English',
        sent: true,
      });
    });
    setSentCount(included.length);
  };

  if (sentCount != null) {
    return (
      <Screen title="">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
          <div className="cc-anim-pop" style={{ width: 72, height: 72, borderRadius: '50%', background: T.accent, display: 'grid', placeItems: 'center', boxShadow: `0 16px 32px -12px ${T.accentGlow}`, animation: 'cc-pop .5s cubic-bezier(.22,.8,.3,1) backwards' }}>
            <CheckCheck size={36} strokeWidth={2.5} color="#fff" />
          </div>
          <h2 style={{ fontFamily: space.display, fontWeight: 700, fontSize: 24, margin: '20px 0 8px' }}>
            {sentCount} {sentCount === 1 ? 'recap' : 'recaps'} sent
          </h2>
          <p style={{ fontSize: 14.5, color: T.ink70, maxWidth: 300, lineHeight: 1.5 }}>
            Each {brand.person}'s family got their own personalized update from {group.name} — and it's saved to every timeline.
          </p>
          <div style={{ marginTop: 24, width: '100%', maxWidth: 320 }}>
            <PrimaryButton onClick={onDone}>Done</PrimaryButton>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      title="Review group recaps"
      onBack={onBack}
      footer={
        <PrimaryButton disabled={included.length === 0} onClick={sendAll}>
          <Send size={16} strokeWidth={2.25} />
          Send {included.length} {included.length === 1 ? 'recap' : 'recaps'} to families
        </PrimaryButton>
      }
    >
      <p style={{ fontSize: 13.5, color: T.ink40, marginBottom: 14, lineHeight: 1.5 }}>
        One per {brand.person} — edit any of them, or tap Skip. You can fine-tune a recap later from {/^[aeiou]/i.test(brand.person) ? 'an' : 'a'} {brand.person}'s timeline.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((it) => (
          <div key={it.athleteId} style={{ background: T.surface, border: `1px solid ${it.included ? T.line : T.lineStrong}`, borderRadius: T.r, padding: 14, boxShadow: T.shadowSoft, opacity: it.included ? 1 : 0.55 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: it.included ? 10 : 0 }}>
              <Avatar name={it.name} size={34} />
              <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>{it.name}</span>
              <button
                onClick={() => update(it.athleteId, { included: !it.included })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 600, color: it.included ? T.ink40 : T.accentText }}
              >
                {it.included ? <><X size={14} /> Skip</> : <><Check size={14} /> Include</>}
              </button>
            </div>
            {it.included && (
              <>
                <input
                  value={it.headline}
                  onChange={(e) => update(it.athleteId, { headline: e.target.value })}
                  style={{ width: '100%', fontFamily: space.display, fontWeight: 700, fontSize: 16, color: T.ink, border: 'none', outline: 'none', background: 'transparent', borderBottom: `1.5px dashed ${T.line}`, paddingBottom: 5, marginBottom: 9 }}
                />
                <textarea
                  value={it.parentMessage}
                  onChange={(e) => update(it.athleteId, { parentMessage: e.target.value })}
                  rows={4}
                  style={{ width: '100%', padding: 11, borderRadius: T.rSm, border: `1.5px solid ${T.line}`, background: T.surface, fontSize: 13.5, lineHeight: 1.55, color: T.ink, outline: 'none' }}
                />
                {it.homework && (
                  <div style={{ marginTop: 9, padding: '8px 11px', borderRadius: T.rSm, background: T.accentSoft, fontSize: 12.5, lineHeight: 1.5, color: T.accentText }}>
                    <strong style={{ fontWeight: 700 }}>{brand.recap.homework}:</strong> {it.homework}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </Screen>
  );
}
