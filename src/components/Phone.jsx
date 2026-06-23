import { T } from '../lib/sports';
import { useMedia } from '../lib/useMedia';

// The phone frame the app lives inside on desktop. On small screens the bezel is
// dropped and the app fills the viewport so it stays genuinely usable on a phone.
export default function Phone({ children }) {
  const narrow = useMedia('(max-width: 560px)');

  if (narrow) {
    return (
      <div
        className="cc-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          background: T.bg,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        placeItems: 'center',
        padding: '26px 16px 34px',
        // ambient warm wash behind the device
        background: `radial-gradient(120% 90% at 50% -10%, #FBF6EF 0%, ${T.bg} 55%)`,
      }}
    >
      <div
        style={{
          width: 392,
          height: 'min(800px, calc(100dvh - 130px))',
          background: '#1C1813',
          borderRadius: 46,
          padding: 11,
          boxShadow: T.shadowPhone,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: T.bg,
            borderRadius: 36,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* notch */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 9,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 112,
              height: 26,
              background: '#1C1813',
              borderRadius: 999,
              zIndex: 30,
            }}
          />
          {children}
        </div>
      </div>
    </div>
  );
}
