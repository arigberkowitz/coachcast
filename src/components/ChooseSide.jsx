import { Dribbble, GraduationCap, Users, ArrowRight, Sparkles } from 'lucide-react';
import { T, space } from '../lib/sports';
import { BRANDS, FAMILY } from '../lib/brands';
import { useBrand } from '../auth/BrandContext';

const SIDES = [
  { brand: BRANDS.coach, Icon: Dribbble },
  { brand: BRANDS.tutor, Icon: GraduationCap },
  { brand: FAMILY, Icon: Users },
];

function SideCard({ brand, Icon, onPick }) {
  const a = brand.accent;
  return (
    <button
      onClick={onPick}
      style={{
        flex: 1,
        minWidth: 200,
        textAlign: 'left',
        background: T.surface,
        border: `1.5px solid ${T.line}`,
        borderRadius: T.rLg,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: T.shadowSoft,
        transition: 'border-color .15s ease, transform .12s ease, box-shadow .15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = a.accent;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 18px 36px -20px ${a.accentGlow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = T.line;
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = T.shadowSoft;
      }}
    >
      <span style={{ width: 46, height: 46, borderRadius: 14, background: a.accentSoft, color: a.accent, display: 'grid', placeItems: 'center' }}>
        <Icon size={24} strokeWidth={2.1} />
      </span>
      <div>
        <div style={{ fontFamily: space.display, fontWeight: 700, fontSize: 20, letterSpacing: '-.01em', color: T.ink }}>
          {brand.chooser.title}
        </div>
        <div style={{ fontSize: 13.5, color: T.ink40, marginTop: 3, lineHeight: 1.45 }}>{brand.chooser.sub}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: a.accentText, background: a.accentSoft, borderRadius: 999, padding: '4px 10px' }}>
          {brand.name}
        </span>
        <ArrowRight size={18} strokeWidth={2.25} color={a.accent} />
      </div>
    </button>
  );
}

export default function ChooseSide() {
  const { chooseBrand } = useBrand();

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, display: 'grid', placeItems: 'center', padding: '32px 22px' }}>
      <div className="cc-anim-up" style={{ width: '100%', maxWidth: 760 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: T.ink40, marginBottom: 14 }}>
          <Sparkles size={15} color={T.ink70} /> One tool, your voice
        </div>
        <h1 style={{ fontFamily: space.display, fontWeight: 700, fontSize: 'clamp(30px, 4vw, 42px)', letterSpacing: '-.02em', lineHeight: 1.05, color: T.ink, marginBottom: 8 }}>
          What do you do?
        </h1>
        <p style={{ fontSize: 15.5, color: T.ink70, marginBottom: 26, maxWidth: 460 }}>
          Turn a twenty-second note after each session into a parent-ready progress update — in your voice. Pick your side to get started.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {SIDES.map(({ brand, Icon }) => (
            <SideCard key={brand.id} brand={brand} Icon={Icon} onPick={() => chooseBrand(brand.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
