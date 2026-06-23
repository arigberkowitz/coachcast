import { useState } from 'react';
import { Send, Plus, X, Check, Pencil, RotateCw, Languages, LoaderCircle } from 'lucide-react';
import { T, space, sportById, TONES } from '../lib/sports';
import { generateRecap, translateRecap } from '../lib/api';
import { Avatar, PrimaryButton, Eyebrow, SelectChip } from './ui';
import Screen from './Screen';

const LANGUAGES = ['Spanish', 'French', 'Portuguese', 'Mandarin', 'Vietnamese'];

function EditableList({ label, items, onChange, max }) {
  const set = (i, v) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <div style={{ marginTop: 18 }}>
      <Eyebrow style={{ marginBottom: 8 }}>{label}</Eyebrow>
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
            <button onClick={() => remove(i)} aria-label="Remove" style={{ color: T.ink40, display: 'grid', placeItems: 'center', padding: 2 }}>
              <X size={15} />
            </button>
          </div>
        ))}
        {items.length < max && (
          <button onClick={add} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', fontSize: 13, fontWeight: 600, color: T.ink40, padding: '4px 2px' }}>
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

  const [tone, setTone] = useState(draft.tone || 'warm');
  const [busy, setBusy] = useState(''); // '' | 'regen' | 'translate'
  const [error, setError] = useState('');
  const [showLangs, setShowLangs] = useState(false);
  const [translatedTo, setTranslatedTo] = useState(null);
  const [englishBackup, setEnglishBackup] = useState(null);

  const s = sportById(draft.sport || athlete.sport);
  const canRegen = !!draft.transcript;
  const regenning = busy === 'regen';

  const regenerate = async (newTone) => {
    if (busy) return;
    setError('');
    setBusy('regen');
    try {
      const r = await generateRecap({ sport: draft.sport || athlete.sport, tone: newTone, athlete, transcript: draft.transcript });
      setHeadline(r.headline || '');
      setWorkedOn(r.workedOn || []);
      setImproved(r.improved || []);
      setNextFocus(r.nextFocus || []);
      setParentMessage(r.parentMessage || '');
      setTone(newTone);
      setTranslatedTo(null);
      setEnglishBackup(null);
      setShowLangs(false);
    } catch {
      setError("Couldn't rewrite the recap. Try again.");
    } finally {
      setBusy('');
    }
  };

  const translate = async (language) => {
    if (busy) return;
    setError('');
    setBusy('translate');
    setShowLangs(false);
    const backup = englishBackup ?? parentMessage;
    try {
      const { text } = await translateRecap({ text: backup, language });
      setEnglishBackup(backup);
      setParentMessage(text);
      setTranslatedTo(language);
    } catch {
      setError("Couldn't translate the message. Try again.");
    } finally {
      setBusy('');
    }
  };

  const revertEnglish = () => {
    if (englishBackup != null) setParentMessage(englishBackup);
    setTranslatedTo(null);
  };

  const send = () => {
    onSend({
      ...draft,
      tone,
      headline: headline.trim(),
      workedOn: workedOn.map((x) => x.trim()).filter(Boolean),
      improved: improved.map((x) => x.trim()).filter(Boolean),
      nextFocus: nextFocus.map((x) => x.trim()).filter(Boolean),
      parentMessage: parentMessage.trim(),
      language: translatedTo || 'English',
    });
  };

  return (
    <Screen
      title="Review recap"
      onBack={onBack}
      footer={
        <PrimaryButton disabled={!parentMessage.trim() || !headline.trim() || !!busy} onClick={send}>
          <Send size={16} strokeWidth={2.25} />
          Send to {athlete.name.split(' ')[0]}'s parent
        </PrimaryButton>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
        <Avatar name={athlete.name} size={40} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{athlete.name}</div>
          <div style={{ fontSize: 12.5, color: T.ink40, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <s.Icon size={12} color={T.accent} strokeWidth={2.25} /> {s.label}
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: T.accentText, background: T.accentSoft, borderRadius: 999, padding: '5px 10px' }}>
          <Pencil size={11} strokeWidth={2.5} /> Editable
        </span>
      </div>

      {/* AI tools: rewrite in a different voice */}
      {canRegen && (
        <div style={{ border: `1px solid ${T.line}`, background: T.surfaceAlt, borderRadius: T.r, padding: 12, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
            <Eyebrow>Rewrite in a voice</Eyebrow>
            <button
              onClick={() => regenerate(tone)}
              disabled={!!busy}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: T.accentText, opacity: busy ? 0.5 : 1 }}
            >
              <RotateCw size={13} strokeWidth={2.5} /> Rewrite
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {TONES.map((t) => (
              <SelectChip
                key={t.id}
                active={tone === t.id}
                disabled={!!busy}
                onClick={() => (t.id === tone ? null : regenerate(t.id))}
                style={{ opacity: busy && tone !== t.id ? 0.5 : 1 }}
              >
                {t.label}
              </SelectChip>
            ))}
          </div>
          {regenning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, fontSize: 12.5, color: T.ink40 }}>
              <LoaderCircle size={14} style={{ animation: 'cc-spin 1s linear infinite' }} /> Rewriting in {tone} voice…
            </div>
          )}
        </div>
      )}

      {/* the editable recap (dimmed while a rewrite is in flight) */}
      <div style={{ opacity: regenning ? 0.45 : 1, pointerEvents: regenning ? 'none' : 'auto', transition: 'opacity .2s ease' }}>
        <Eyebrow style={{ margin: '18px 0 7px' }}>Headline</Eyebrow>
        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          style={{ width: '100%', fontFamily: space.display, fontWeight: 700, fontSize: 21, letterSpacing: '-.01em', color: T.ink, border: 'none', outline: 'none', background: 'transparent', borderBottom: `1.5px dashed ${T.line}`, paddingBottom: 6 }}
        />

        <EditableList label="Worked on" items={workedOn} onChange={setWorkedOn} max={3} />
        <EditableList label="Improved" items={improved} onChange={setImproved} max={3} />
        <EditableList label="Up next" items={nextFocus} onChange={setNextFocus} max={2} />

        {/* parent message + translate */}
        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Eyebrow>Message to parent</Eyebrow>
            {translatedTo ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: T.ink40 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: T.accentText, fontWeight: 600 }}>
                  <Languages size={12} strokeWidth={2.5} /> {translatedTo}
                </span>
                <button onClick={revertEnglish} style={{ fontSize: 12, fontWeight: 600, color: T.ink70 }}>Revert</button>
              </span>
            ) : (
              <button
                onClick={() => setShowLangs((v) => !v)}
                disabled={!!busy}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: T.accentText, opacity: busy ? 0.5 : 1 }}
              >
                <Languages size={13} strokeWidth={2.5} /> Translate
              </button>
            )}
          </div>

          {showLangs && !translatedTo && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
              {LANGUAGES.map((lang) => (
                <SelectChip key={lang} active={false} disabled={!!busy} onClick={() => translate(lang)}>
                  {lang}
                </SelectChip>
              ))}
            </div>
          )}

          {busy === 'translate' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, fontSize: 12.5, color: T.ink40 }}>
              <LoaderCircle size={14} style={{ animation: 'cc-spin 1s linear infinite' }} /> Translating…
            </div>
          )}

          <textarea
            value={parentMessage}
            onChange={(e) => setParentMessage(e.target.value)}
            rows={7}
            style={{ width: '100%', padding: 14, borderRadius: T.r, border: `1.5px solid ${T.line}`, background: T.surface, fontSize: 14.5, lineHeight: 1.6, color: T.ink, outline: 'none', transition: 'border-color .15s ease' }}
            onFocus={(e) => (e.target.style.borderColor = T.accent)}
            onBlur={(e) => (e.target.style.borderColor = T.line)}
          />
          <div style={{ fontSize: 11.5, color: T.ink40, marginTop: 7, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Check size={12} strokeWidth={2.5} color={T.accent} />
            You review and edit every word before it sends.
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" style={{ color: T.accentText, fontSize: 13, fontWeight: 600, marginTop: 12, textAlign: 'center' }}>
          {error}
        </div>
      )}
    </Screen>
  );
}
