import { useState } from 'react';
import { ArrowRight, Sparkles, Check, ChevronLeft } from 'lucide-react';
import { T, space } from '../lib/sports';
import { useAuth } from '../auth/AuthContext';
import { useBrand } from '../auth/BrandContext';
import { useMedia } from '../lib/useMedia';

function Field({ label, ...props }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.ink70, marginBottom: 6 }}>{label}</span>
      <input
        {...props}
        style={{ width: '100%', padding: '12px 14px', borderRadius: T.rSm, border: `1.5px solid ${T.line}`, background: T.surface, fontSize: 15, transition: 'border-color .15s ease, box-shadow .15s ease' }}
        onFocus={(e) => {
          e.target.style.borderColor = T.accent;
          e.target.style.boxShadow = `0 0 0 4px ${T.accentSoft}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = T.line;
          e.target.style.boxShadow = 'none';
        }}
      />
    </label>
  );
}

function BrandPanel({ brand, compact }) {
  const { auth } = brand;
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(155deg, ${T.accent} 0%, ${T.accentText} 100%)`,
        color: '#fff',
        padding: compact ? '34px 26px 30px' : '56px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: compact ? 'flex-start' : 'space-between',
        minHeight: compact ? 'auto' : '100%',
      }}
    >
      <div aria-hidden style={{ position: 'absolute', width: 420, height: 420, right: -120, top: -120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.22), transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontFamily: space.display, fontWeight: 700, fontSize: 20, letterSpacing: '-.01em' }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,.18)', display: 'grid', placeItems: 'center' }}>
            <Sparkles size={15} />
          </span>
          {brand.name}
        </div>
      </div>

      {!compact && (
        <div style={{ position: 'relative', maxWidth: 440 }}>
          <h1 style={{ fontFamily: space.display, fontWeight: 700, fontSize: 'clamp(34px, 3.4vw, 50px)', lineHeight: 1.04, letterSpacing: '-.02em', marginBottom: 18 }}>
            {auth.heroLine1}
            <br />
            {auth.heroLine2}
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: 'rgba(255,255,255,.92)', maxWidth: 380 }}>{auth.subhead}</p>
          <RecapPreview sample={auth.sample} />
        </div>
      )}

      <div style={{ position: 'relative', fontSize: 13, color: 'rgba(255,255,255,.82)', marginTop: compact ? 18 : 0 }}>
        {compact ? auth.subhead : auth.footnote}
      </div>
    </div>
  );
}

function RecapPreview({ sample }) {
  return (
    <div className="cc-anim-in" style={{ marginTop: 30, background: '#fff', color: T.ink, borderRadius: T.rLg, padding: 18, boxShadow: '0 30px 60px -24px rgba(40,30,20,.5)', maxWidth: 340, transform: 'rotate(-1.4deg)' }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', color: T.ink40, textTransform: 'uppercase' }}>{sample.for}</div>
      <div style={{ fontFamily: space.display, fontWeight: 700, fontSize: 18, letterSpacing: '-.01em', margin: '6px 0 10px' }}>{sample.headline}</div>
      <p style={{ fontSize: 13.5, lineHeight: 1.55, color: T.ink70 }}>{sample.body}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        {sample.tags.map((t) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: T.accentText, background: T.accentSoft, borderRadius: 999, padding: '4px 9px' }}>
            <Check size={11} strokeWidth={3} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Auth() {
  const { signIn } = useAuth();
  const { brand, clearBrand } = useBrand();
  const narrow = useMedia('(max-width: 880px)');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const res = signIn({ email, password });
    if (!res.ok) setError(res.error);
  };

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1.05fr .95fr', background: T.bg }}>
      <BrandPanel brand={brand} compact={narrow} />

      <div style={{ display: 'grid', placeItems: 'center', padding: narrow ? '32px 22px 48px' : '40px' }}>
        <form onSubmit={submit} className="cc-anim-up" style={{ width: '100%', maxWidth: 380 }}>
          <button
            type="button"
            onClick={clearBrand}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: T.ink40, marginBottom: 18, marginLeft: -4 }}
          >
            <ChevronLeft size={16} /> Choose a different side
          </button>

          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: T.ink40 }}>{brand.auth.eyebrow}</div>
          <h2 style={{ fontFamily: space.display, fontWeight: 700, fontSize: 30, letterSpacing: '-.02em', margin: '8px 0 26px' }}>Welcome back</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Field label="Password" type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <div role="alert" style={{ color: T.accentText, fontSize: 13.5, fontWeight: 600, marginTop: 12 }}>{error}</div>}

          <button
            type="submit"
            style={{ width: '100%', marginTop: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 18px', borderRadius: T.r, background: T.accent, color: '#fff', fontWeight: 600, fontSize: 15, boxShadow: `0 10px 24px -10px ${T.accentGlow}`, transition: 'transform .12s ease' }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(.985)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'none')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            Sign in
            <ArrowRight size={17} strokeWidth={2.5} />
          </button>

          <div style={{ marginTop: 18, padding: '11px 13px', borderRadius: T.rSm, background: T.surfaceAlt, border: `1px solid ${T.line}`, fontSize: 12.5, color: T.ink40, lineHeight: 1.5 }}>
            <strong style={{ color: T.ink70, fontWeight: 700 }}>Demo</strong> — any email and a 6+ character password works. No account is created and nothing leaves this device.
          </div>
        </form>
      </div>
    </div>
  );
}
