import { Sparkles, Users } from 'lucide-react';
import { T } from '../lib/sports';
import { useBrand } from '../auth/BrandContext';

export default function TabBar({ active, onChange }) {
  const { brand } = useBrand();
  const TABS = [
    { id: 'today', label: 'Today', Icon: Sparkles },
    { id: 'athletes', label: brand.personPlural, Icon: Users },
  ];
  return (
    <nav
      style={{
        flexShrink: 0,
        display: 'flex',
        borderTop: `1px solid ${T.line}`,
        background: T.bg,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {TABS.map((t) => {
        const on = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            aria-current={on ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '9px 0 11px',
              color: on ? T.accent : T.ink40,
              fontWeight: 600,
              transition: 'color .15s ease',
            }}
          >
            <t.Icon size={21} strokeWidth={on ? 2.4 : 2} />
            <span style={{ fontSize: 11 }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
