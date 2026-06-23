import { useState } from 'react';
import { Send, Plus, X, Check, Pencil } from 'lucide-react';
import { T, space, sportById, TONES } from '../lib/sports';
import { Avatar, PrimaryButton, Eyebrow } from './ui';
import Screen from './Screen';

function EditableList({ label, items, onChange, max, accent }) {
  const set = (i, v) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <div style={{ marginTop: 18 }}>
      <Eyebrow style={{ marginBottom: 8, color: accent ? T.accentText : T.ink40 }}>{label}</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              background: T.surface,
              border: `1px solid ${T.line}`,
              borderRadius: T.rSm,
              padding: '9px 10px 9px 12px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />
            <input
              value={it}
              onChange={(e) => set(i, e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: T.ink }}
            />
            <button
              onClick={() => remove(i)}
              aria-label="Remove"
              style={{ color: T.ink40, display: 'grid', placeItems: 'center', padding: 2 }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
        {items.length < max && (
          <button
            onClick={add}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              alignSelf: 'flex-start',
              fontSize: 13,
              fontWeight: 600,
              color: T.ink40,
              padding: '4px 2px',
            }}
          >
            <Plus size={14} strokeWidth={2.5} /> Add
          </button>
        )}
      </div>
    </div>
  );
}

export default function Review({ athlete, draft, onBack, onSend }) {
  const [headline, setHeadline] = useState(draft.headline || '');
  const [workedOn, setWorkedOn] = useState(draft.workedOn || []);
  const [improved, setImproved] = useState(draft.improved || []);
  const [nextFocus, setNextFocus] = useState(draft.nextFocus || []);
  const [parentMessage, setParentMessage] = useState(draft.parentMessage || '');

  const s = sportById(draft.sport || athlete.sport);
  const tone = TONES.find((t) => t.id === draft.tone);

  const send = () => {
    onSend({
      ...draft,
      headline: headline.trim(),
      workedOn: workedOn.map((x) => x.trim()).filter(Boolean),
      improved: improved.map((x) => x.trim()).filter(Boolean),
      nextFocus: nextFocus.map((x) => x.trim()).filter(Boolean),
      parentMessage: parentMessage.trim(),
    });
  };

  return (
    <Screen
      title="Review recap"
      onBack={onBack}
      footer={
        <PrimaryButton disabled={!parentMessage.trim() || !headline.trim()} onClick={send}>
          <Send size={16} strokeWidth={2.25} />
          Send to {athlete.name.split(' ')[0]}'s parent
        </PrimaryButton>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 }}>
        <Avatar name={athlete.name} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{athlete.name}</div>
          <div style={{ fontSize: 12.5, color: T.ink40, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <s.Icon size={12} color={T.accent} strokeWidth={2.25} /> {s.label}
            {tone && <span>· {tone.label} voice</span>}
          </div>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 11.5,
            fontWeight: 600,
            color: T.accentText,
            background: T.accentSoft,
            borderRadius: 999,
            padding: '5px 10px',
          }}
        >
          <Pencil size={11} strokeWidth={2.5} /> Editable
        </span>
      </div>

      {/* headline */}
      <Eyebrow style={{ marginBottom: 7 }}>Headline</Eyebrow>
      <input
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        style={{
          width: '100%',
          fontFamily: space.display,
          fontWeight: 700,
          fontSize: 21,
          letterSpacing: '-.01em',
          color: T.ink,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          borderBottom: `1.5px dashed ${T.line}`,
          paddingBottom: 6,
        }}
      />

      <EditableList label="Worked on" items={workedOn} onChange={setWorkedOn} max={3} />
      <EditableList label="Improved" items={improved} onChange={setImproved} max={3} />
      <EditableList label="Up next" items={nextFocus} onChange={setNextFocus} max={2} />

      {/* parent message — the thing that actually gets sent */}
      <div style={{ marginTop: 22 }}>
        <Eyebrow style={{ marginBottom: 8 }}>Message to parent</Eyebrow>
        <textarea
          value={parentMessage}
          onChange={(e) => setParentMessage(e.target.value)}
          rows={7}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: T.r,
            border: `1.5px solid ${T.line}`,
            background: T.surface,
            fontSize: 14.5,
            lineHeight: 1.6,
            color: T.ink,
            outline: 'none',
            transition: 'border-color .15s ease',
          }}
          onFocus={(e) => (e.target.style.borderColor = T.accent)}
          onBlur={(e) => (e.target.style.borderColor = T.line)}
        />
        <div style={{ fontSize: 11.5, color: T.ink40, marginTop: 7, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Check size={12} strokeWidth={2.5} color={T.accent} />
          You review and edit every word before it sends.
        </div>
      </div>
    </Screen>
  );
}
