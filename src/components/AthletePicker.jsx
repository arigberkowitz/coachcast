import { X } from 'lucide-react';
import { T, space, sportById } from '../lib/sports';
import { useStore } from '../data/store';
import { Avatar, IconButton } from './ui';

// Bottom sheet: pick an athlete to start a recap, then jump to Capture.
export default function AthletePicker({ onClose, onPick }) {
  const { athletes } = useStore();

  return (
    <div
      className="cc-anim-in"
      style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
    >
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(33,28,23,.4)' }} />
      <div
        className="cc-anim-rise"
        style={{
          position: 'relative',
          background: T.bg,
          borderTopLeftRadius: T.rLg,
          borderTopRightRadius: T.rLg,
          padding: '18px 16px calc(env(safe-area-inset-bottom, 0px) + 16px)',
          boxShadow: '0 -20px 50px -20px rgba(33,28,23,.4)',
          maxHeight: '78%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontFamily: space.display, fontWeight: 700, fontSize: 19, letterSpacing: '-.01em' }}>
            Who did you work with?
          </h3>
          <IconButton label="Close" onClick={onClose} style={{ marginRight: -6 }}>
            <X size={20} />
          </IconButton>
        </div>

        <div className="cc-scroll" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {athletes.map((a) => {
            const s = sportById(a.sport);
            return (
              <button
                key={a.id}
                onClick={() => onPick(a.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 11,
                  borderRadius: T.r,
                  background: T.surface,
                  border: `1px solid ${T.line}`,
                  textAlign: 'left',
                  transition: 'border-color .15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.line)}
              >
                <Avatar name={a.name} size={38} />
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: 15 }}>{a.name}</span>
                  <span style={{ fontSize: 12.5, color: T.ink40, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <s.Icon size={12} color={T.accent} strokeWidth={2.25} /> {s.label} · Age {a.age}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
