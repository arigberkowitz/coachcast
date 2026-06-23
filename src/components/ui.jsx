// Small shared primitives so every screen speaks the same visual language.
import { T, space, sportById } from '../lib/sports';

const initials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

// Soft, warm-leaning tints so each person reads as their own — varied but calm,
// and harmonious with the cream surfaces. Action colors stay the brand accent.
const AVATAR_TINTS = [
  ['#FFD9C7', '#B23E16'], // peach
  ['#FCE2B0', '#8A5A07'], // amber
  ['#F7D2DD', '#A33A5C'], // rose
  ['#D9EAC8', '#4C7234'], // sage
  ['#CFE3F5', '#2C5C8A'], // sky
  ['#E3DCF6', '#54409A'], // lavender
  ['#CFECE1', '#1E6E55'], // teal
];

function tintFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}

export function Avatar({ name, size = 44 }) {
  const [bg, fg] = tintFor(name);
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        background: bg,
        color: fg,
        fontFamily: space.display,
        fontWeight: 700,
        fontSize: size * 0.36,
        letterSpacing: '.01em',
      }}
    >
      {initials(name)}
    </div>
  );
}

export function SportBadge({ sport, subtle = false }) {
  const s = sportById(sport);
  const Icon = s.Icon;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px 3px 7px',
        borderRadius: T.rPill,
        background: subtle ? 'transparent' : T.surfaceAlt,
        border: `1px solid ${subtle ? 'transparent' : T.line}`,
        color: T.ink70,
        fontSize: 12.5,
        fontWeight: 600,
      }}
    >
      <Icon size={13} strokeWidth={2.25} color={T.accent} />
      {s.label}
    </span>
  );
}

export function PrimaryButton({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        width: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '14px 18px',
        borderRadius: T.r,
        background: props.disabled
          ? '#E6D8CC'
          : `linear-gradient(140deg, ${T.accent} 0%, color-mix(in srgb, ${T.accent} 84%, #000) 100%)`,
        color: '#fff',
        fontWeight: 600,
        fontSize: 15,
        boxShadow: props.disabled ? 'none' : `0 8px 20px -8px ${T.accentGlow}`,
        transition: 'transform .12s ease, filter .15s ease, background .15s ease',
        ...style,
      }}
      onMouseDown={(e) => !props.disabled && (e.currentTarget.style.transform = 'scale(.985)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'none')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, style, ...props }) {
  return (
    <button
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '12px 16px',
        borderRadius: T.r,
        background: T.surface,
        border: `1px solid ${T.line}`,
        color: T.ink,
        fontWeight: 600,
        fontSize: 14.5,
        transition: 'background .15s ease, border-color .15s ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, label, style, ...props }) {
  return (
    <button
      {...props}
      aria-label={label}
      title={label}
      style={{
        width: 38,
        height: 38,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 11,
        background: 'transparent',
        color: T.ink70,
        transition: 'background .15s ease, color .15s ease',
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = T.surfaceAlt)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </button>
  );
}

export function SelectChip({ active, children, style, ...props }) {
  return (
    <button
      {...props}
      aria-pressed={active}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '9px 13px',
        borderRadius: T.rPill,
        border: `1.5px solid ${active ? T.accent : T.line}`,
        background: active ? T.accentSoft : T.surface,
        color: active ? T.accentText : T.ink70,
        fontWeight: 600,
        fontSize: 13.5,
        transition: 'all .15s ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Eyebrow({ children, style }) {
  return (
    <div
      style={{
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        color: T.ink40,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
