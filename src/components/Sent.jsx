import { Check } from 'lucide-react';
import { T, space } from '../lib/sports';
import { PrimaryButton, GhostButton } from './ui';

export default function Sent({ athlete, recap, onViewTimeline, onDone }) {
  const first = athlete.name.split(' ')[0];
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'calc(env(safe-area-inset-top, 0px) + 44px) 26px calc(env(safe-area-inset-bottom, 0px) + 22px)',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="cc-anim-pop"
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: T.accent,
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 16px 32px -12px rgba(255,90,44,.8)',
            animation: 'cc-pop .5s cubic-bezier(.22,.8,.3,1) backwards',
          }}
        >
          <Check size={38} strokeWidth={3} color="#fff" />
        </div>

        <h2
          className="cc-anim-up"
          style={{
            fontFamily: space.display,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: '-.02em',
            margin: '22px 0 8px',
          }}
        >
          Sent to {first}'s parent
        </h2>
        <p className="cc-anim-up" style={{ fontSize: 14.5, color: T.ink70, lineHeight: 1.55, maxWidth: 280 }}>
          “{recap.headline}” is on its way, and it's saved to {first}'s timeline.
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PrimaryButton onClick={onViewTimeline}>View {first}'s timeline</PrimaryButton>
        <GhostButton style={{ width: '100%' }} onClick={onDone}>
          Back to athletes
        </GhostButton>
      </div>
    </div>
  );
}
