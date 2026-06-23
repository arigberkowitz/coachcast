import { useState } from 'react';
import { Plus, ChevronRight, Mic, X, Search } from 'lucide-react';
import { T, space, sportById } from '../lib/sports';
import { useStore, addAthlete } from '../data/store';
import { useBrand } from '../auth/BrandContext';
import { relativeDate } from '../lib/format';
import { Avatar, IconButton, SelectChip, PrimaryButton } from './ui';
import Screen from './Screen';

function AthleteRow({ athlete, onOpen, onNewRecap }) {
  const s = sportById(athlete.sport);
  const Icon = s.Icon;
  const last = athlete.recaps[0];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: 13,
        borderRadius: T.r,
        background: T.surface,
        border: `1px solid ${T.line}`,
        boxShadow: T.shadowSoft,
        cursor: 'pointer',
        transition: 'border-color .15s ease, transform .12s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.lineStrong)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.line)}
    >
      <Avatar name={athlete.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontWeight: 600, fontSize: 15.5, color: T.ink }}>{athlete.name}</span>
          <Icon size={13} strokeWidth={2.25} color={T.accent} />
        </div>
        <div style={{ fontSize: 12.5, color: T.ink40, marginTop: 1 }}>
          Age {athlete.age} · {s.label} ·{' '}
          {last ? `last recap ${relativeDate(last.createdAt).toLowerCase()}` : 'no recaps yet'}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNewRecap();
        }}
        aria-label={`New recap for ${athlete.name}`}
        title="New recap"
        style={{
          width: 38,
          height: 38,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 11,
          background: T.accentSoft,
          color: T.accentText,
          transition: 'background .15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = T.accentSoft2)}
        onMouseLeave={(e) => (e.currentTarget.style.background = T.accentSoft)}
      >
        <Mic size={17} strokeWidth={2.25} />
      </button>
      <ChevronRight size={18} color={T.ink40} style={{ flexShrink: 0, marginLeft: -4 }} />
    </div>
  );
}

function AddAthleteSheet({ onClose, onAdded }) {
  const { brand } = useBrand();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sport, setSport] = useState(brand.categories[0].id);
  const valid = name.trim().length > 1 && Number(age) > 0 && Number(age) < 100;

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
          padding: '18px 18px calc(env(safe-area-inset-bottom, 0px) + 18px)',
          boxShadow: '0 -20px 50px -20px rgba(33,28,23,.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontFamily: space.display, fontWeight: 700, fontSize: 19, letterSpacing: '-.01em' }}>
            Add {brand.person}
          </h3>
          <IconButton label="Close" onClick={onClose} style={{ marginRight: -6 }}>
            <X size={20} />
          </IconButton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            autoFocus
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Age"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))}
            style={inputStyle}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {brand.categories.map((s) => (
              <SelectChip key={s.id} active={sport === s.id} onClick={() => setSport(s.id)}>
                <s.Icon size={14} strokeWidth={2.25} color={sport === s.id ? T.accent : T.ink40} />
                {s.label}
              </SelectChip>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <PrimaryButton
            disabled={!valid}
            onClick={() => {
              const a = addAthlete({ name, age, sport });
              onAdded(a);
            }}
          >
            <Plus size={17} strokeWidth={2.5} />
            Add {brand.person}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: T.rSm,
  border: `1.5px solid ${T.line}`,
  background: T.surface,
  fontSize: 15,
};

export default function Home({ onOpenAthlete, onNewRecap }) {
  const { athletes } = useStore();
  const { brand } = useBrand();
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState('');

  const peopleLower = brand.personPlural.toLowerCase();
  const q = query.trim().toLowerCase();
  const filtered = q ? athletes.filter((a) => a.name.toLowerCase().includes(q)) : athletes;

  return (
    <Screen
      title={brand.personPlural}
      action={
        <IconButton label={`Add ${brand.person}`} onClick={() => setAdding(true)} style={{ marginRight: -6 }}>
          <Plus size={22} strokeWidth={2.25} color={T.accent} />
        </IconButton>
      }
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '10px 13px',
          borderRadius: T.r,
          background: T.surface,
          border: `1.5px solid ${T.line}`,
          marginBottom: 14,
        }}
      >
        <Search size={17} color={T.ink40} strokeWidth={2.25} style={{ flexShrink: 0 }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${peopleLower}`}
          aria-label={`Search ${peopleLower}`}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: T.ink }}
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Clear search" style={{ color: T.ink40, display: 'grid', placeItems: 'center' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 20px', color: T.ink40, fontSize: 14 }}>
          No {peopleLower} match “{query}”.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((a) => (
            <AthleteRow
              key={a.id}
              athlete={a}
              onOpen={() => onOpenAthlete(a.id)}
              onNewRecap={() => onNewRecap(a.id)}
            />
          ))}
        </div>
      )}

      {adding && (
        <AddAthleteSheet
          onClose={() => setAdding(false)}
          onAdded={(a) => {
            setAdding(false);
            onOpenAthlete(a.id);
          }}
        />
      )}
    </Screen>
  );
}
