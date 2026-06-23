import { T } from '../lib/sports';

// Just the app — it fills whatever it's on. Full-bleed on phone and computer
// alike; no device frame, no marketing panel. Content is capped to a comfortable
// column width and centered so it stays readable on wide screens.
export default function Phone({ children }) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center', background: T.bg }}>
      <div
        className="cc-scroll"
        style={{
          flex: 1,
          minHeight: 0,
          maxWidth: 720,
          background: T.bg,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `1px solid ${T.line}`,
          borderRight: `1px solid ${T.line}`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
