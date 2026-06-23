import { ChevronLeft } from 'lucide-react';
import { T, space } from '../lib/sports';
import { IconButton } from './ui';

// One screen inside the phone: a header that clears the notch, a scrollable body,
// and an optional sticky footer for the primary action.
export default function Screen({ title, onBack, action, footer, children, bodyStyle }) {
  return (
    <div className="cc-anim-slide" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div
        style={{
          flexShrink: 0,
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 44px)',
          padding: 'calc(env(safe-area-inset-top, 0px) + 44px) 16px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {onBack ? (
          <IconButton label="Back" onClick={onBack} style={{ marginLeft: -8 }}>
            <ChevronLeft size={22} strokeWidth={2.25} />
          </IconButton>
        ) : (
          <span style={{ width: 30 }} />
        )}
        <div
          style={{
            flex: 1,
            fontFamily: space.display,
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: '-.01em',
            color: T.ink,
          }}
        >
          {title}
        </div>
        {action}
      </div>

      <div
        className="cc-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '4px 16px 20px',
          ...bodyStyle,
        }}
      >
        {children}
      </div>

      {footer && (
        <div
          style={{
            flexShrink: 0,
            padding: '12px 16px calc(env(safe-area-inset-bottom, 0px) + 16px)',
            borderTop: `1px solid ${T.line}`,
            background: T.bg,
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
