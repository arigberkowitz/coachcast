import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { T, space } from '../lib/sports';
import { useBrand } from '../auth/BrandContext';
import { updateAthlete, deleteAthlete } from '../data/store';
import { IconButton, SelectChip, PrimaryButton } from './ui';

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: T.rSm,
  border: `1.5px solid ${T.line}`,
  background: T.surface,
  fontSize: 15,
};

// Bottom sheet: edit a player/student's profile, or remove them.
export default function EditAthleteSheet({ athlete, onClose, onDeleted }) {
  const { brand } = useBrand();
  const [name, setName] = useState(athlete.name);
  const [age, setAge] = useState(String(athlete.age));
  const [sport, setSport] = useState(athlete.sport);
  const [confirm, setConfirm] = useState(false);
  const valid = name.trim().length > 1 && Number(age) > 0 && Number(age) < 100;

  return (
    <div className="cc-anim-in" style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
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
          <h3 style={{ fontFamily: space.display, fontWeight: 700, fontSize: 19, letterSpacing: '-.01em' }}>Edit {brand.person}</h3>
          <IconButton label="Close" onClick={onClose} style={{ marginRight: -6 }}>
            <X size={20} />
          </IconButton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input autoFocus placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          <input placeholder="Age" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
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
              updateAthlete(athlete.id, { name, age, sport });
              onClose();
            }}
          >
            Save changes
          </PrimaryButton>
        </div>

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          {confirm ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13.5 }}>
              <span style={{ color: T.ink40 }}>Remove {athlete.name.split(' ')[0]} and all recaps?</span>
              <button onClick={() => { deleteAthlete(athlete.id); onDeleted(); }} style={{ fontWeight: 700, color: '#B23B2E' }}>Remove</button>
              <button onClick={() => setConfirm(false)} style={{ fontWeight: 600, color: T.ink70 }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#B23B2E', padding: '6px 10px' }}>
              <Trash2 size={14} strokeWidth={2.25} /> Remove {brand.person}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
