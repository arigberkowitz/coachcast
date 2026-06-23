import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { T } from '../lib/sports';
import { relativeDate } from '../lib/format';
import { setRecapReaction, addThreadMessage, markThreadRead } from '../data/store';

const REACTIONS = ['👍', '❤️', '👏'];

// One per-recap conversation: a family reaction, a message thread, and a composer.
// `role` is who's viewing ('coach' | 'family'); `mode` is the athlete's dataset side.
// `onChange` lets a non-reactive parent (the family portal) refresh its snapshot.
export default function RecapThread({ mode, athleteId, recap, role, coachLabel = 'Coach', onChange }) {
  const isFamily = role === 'family';
  const thread = recap.thread || [];
  const [text, setText] = useState('');

  // Seeing the thread marks the other side's messages as read.
  useEffect(() => {
    if (markThreadRead(mode, athleteId, recap.id, role)) onChange?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recap.id, thread.length]);

  const react = (emoji) => {
    setRecapReaction(mode, athleteId, recap.id, emoji);
    onChange?.();
  };

  const send = () => {
    const t = text.trim();
    if (!t) return;
    addThreadMessage(mode, athleteId, recap.id, { from: role, text: t });
    setText('');
    onChange?.();
  };

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${T.line}` }}>
      {/* reaction — family taps, coach sees */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {isFamily ? (
          REACTIONS.map((e) => (
            <button
              key={e}
              onClick={() => react(e)}
              aria-label={`React ${e}`}
              aria-pressed={recap.reaction === e}
              style={{
                fontSize: 16,
                lineHeight: 1,
                padding: '6px 11px',
                borderRadius: 999,
                border: `1.5px solid ${recap.reaction === e ? T.accent : T.line}`,
                background: recap.reaction === e ? T.accentSoft : T.surface,
                transition: 'all .15s ease',
              }}
            >
              {e}
            </button>
          ))
        ) : recap.reaction ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: T.ink70, background: T.surfaceAlt, border: `1px solid ${T.line}`, borderRadius: 999, padding: '4px 10px' }}>
            <span style={{ fontSize: 14 }}>{recap.reaction}</span> from family
          </span>
        ) : (
          <span style={{ fontSize: 12.5, color: T.ink40 }}>No reaction from the family yet</span>
        )}
      </div>

      {/* messages */}
      {thread.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {thread.map((m) => {
            const mine = m.from === role;
            const fromCoach = m.from === 'coach';
            const who = mine ? 'You' : fromCoach ? coachLabel : 'Parent';
            return (
              <div key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '86%' }}>
                <div
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.45,
                    padding: '8px 12px',
                    borderRadius: 13,
                    background: fromCoach ? T.accentSoft : T.surfaceAlt,
                    color: fromCoach ? T.accentText : T.ink,
                    border: `1px solid ${fromCoach ? T.accentSoft2 : T.line}`,
                    borderBottomRightRadius: mine ? 4 : 13,
                    borderBottomLeftRadius: mine ? 13 : 4,
                  }}
                >
                  {m.text}
                </div>
                <div style={{ fontSize: 10.5, color: T.ink40, marginTop: 3, padding: '0 4px', textAlign: mine ? 'right' : 'left' }}>
                  {who} · {relativeDate(m.createdAt)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* composer */}
      <div style={{ display: 'flex', gap: 8, marginTop: 11 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={isFamily ? 'Ask a question…' : 'Reply to the family…'}
          style={{ flex: 1, padding: '10px 14px', borderRadius: T.rPill, border: `1.5px solid ${T.line}`, background: T.surface, fontSize: 14, color: T.ink, outline: 'none', transition: 'border-color .15s ease' }}
          onFocus={(e) => (e.target.style.borderColor = T.accent)}
          onBlur={(e) => (e.target.style.borderColor = T.line)}
        />
        <button
          onClick={send}
          aria-label="Send message"
          disabled={!text.trim()}
          style={{ width: 40, height: 40, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: '50%', background: text.trim() ? T.accent : '#DAD5D0', color: '#fff', transition: 'background .15s ease' }}
        >
          <Send size={16} strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}
