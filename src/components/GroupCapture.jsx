import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, Sparkles, LoaderCircle, Keyboard, Wand2, Users } from 'lucide-react';
import { T, space, TONES } from '../lib/sports';
import { groupRecap, polishNote, errorMessage } from '../lib/api';
import { useSpeech } from '../lib/useSpeech';
import { useBrand } from '../auth/BrandContext';
import { SelectChip, PrimaryButton, Eyebrow } from './ui';
import Screen from './Screen';

export default function GroupCapture({ group, members, initialNote = '', onBack, onGenerated }) {
  const { brand } = useBrand();
  const [transcript, setTranscript] = useState(initialNote);
  const [sport, setSport] = useState(members[0]?.sport || brand.categories[0].id);
  const [tone, setTone] = useState('warm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [polishing, setPolishing] = useState(false);
  const [polished, setPolished] = useState(false);
  const [rawBackup, setRawBackup] = useState(null);

  const { supported, listening, interim, start, stop } = useSpeech({
    onFinal: (chunk) => setTranscript((t) => (t ? `${t} ${chunk}` : chunk).replace(/\s+/g, ' ')),
  });

  const transcriptRef = useRef(transcript);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const polish = useCallback(async () => {
    const raw = (transcriptRef.current || '').trim();
    if (!raw || polishing) return;
    setPolishing(true);
    setError('');
    try {
      const { text } = await polishNote(raw);
      const clean = (text || '').trim();
      if (clean && clean !== raw) {
        setRawBackup(raw);
        setTranscript(clean);
        setPolished(true);
      }
    } catch (e) {
      setError(errorMessage(e, "Couldn't polish the note — your original text is kept."));
    } finally {
      setPolishing(false);
    }
  }, [polishing]);

  const undoPolish = () => {
    if (rawBackup != null) setTranscript(rawBackup);
    setRawBackup(null);
    setPolished(false);
  };

  const prevListening = useRef(false);
  const userStopped = useRef(false);
  useEffect(() => {
    const was = prevListening.current;
    prevListening.current = listening;
    if (was && !listening && userStopped.current) {
      userStopped.current = false;
      const id = setTimeout(() => polish(), 350);
      return () => clearTimeout(id);
    }
  }, [listening, polish]);

  const toggleMic = () => {
    if (listening) {
      userStopped.current = true;
      stop();
    } else {
      setError('');
      setPolished(false);
      setRawBackup(null);
      start();
    }
  };

  const generate = async () => {
    if (!transcript.trim() || loading) return;
    if (listening) stop();
    setError('');
    setLoading(true);
    try {
      const payload = members.map((m) => ({ id: m.id, firstName: m.name.split(' ')[0], age: m.age }));
      const { recaps } = await groupRecap({ mode: brand.id, sport, tone, note: transcript.trim(), members: payload });
      const items = members.map((m, i) => {
        const r = recaps.find((x) => x.id === m.id) || recaps[i] || {};
        return {
          athleteId: m.id,
          name: m.name,
          headline: r.headline || '',
          workedOn: r.workedOn || [],
          improved: r.improved || [],
          nextFocus: r.nextFocus || [],
          homework: r.homework || '',
          homeworkHow: r.homeworkHow || '',
          parentMessage: r.parentMessage || '',
        };
      });
      onGenerated(items, { sport, tone, note: transcript.trim() });
    } catch (e) {
      setError(errorMessage(e, "Couldn't write the group recaps. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      title="Group recap"
      onBack={onBack}
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {error && (
            <div role="alert" style={{ color: T.accentText, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{error}</div>
          )}
          <PrimaryButton disabled={!transcript.trim() || loading || polishing} onClick={generate}>
            {loading ? (
              <>
                <LoaderCircle size={17} strokeWidth={2.5} style={{ animation: 'cc-spin 1s linear infinite' }} />
                Writing {members.length} recaps…
              </>
            ) : (
              <>
                <Sparkles size={17} strokeWidth={2.25} />
                Generate {members.length} recaps
              </>
            )}
          </PrimaryButton>
        </div>
      }
    >
      {/* group header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <span style={{ width: 44, height: 44, borderRadius: 13, background: T.accentSoft, color: T.accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Users size={22} strokeWidth={2.1} />
        </span>
        <div>
          <div style={{ fontFamily: space.display, fontWeight: 700, fontSize: 18, letterSpacing: '-.01em' }}>{group.name}</div>
          <div style={{ fontSize: 12.5, color: T.ink40 }}>{members.length} {brand.personPlural.toLowerCase()}</div>
        </div>
      </div>

      {/* one shared note (mic + Wispr polish) */}
      <Eyebrow style={{ marginBottom: 8 }}>One note for the whole group</Eyebrow>
      <div style={{ borderRadius: T.r, border: `1.5px solid ${listening ? T.accent : T.line}`, background: T.surface, padding: 14, transition: 'border-color .15s ease' }}>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={5}
          placeholder="What did the group work on? Mention anyone who stood out by name — each kid gets their own recap."
          style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 15, lineHeight: 1.55, color: T.ink }}
        />
        {listening && interim && (
          <div style={{ fontSize: 15, lineHeight: 1.55, color: T.ink40, fontStyle: 'italic' }}>{interim}</div>
        )}
        {(polishing || polished) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8, fontSize: 12.5, fontWeight: 600, color: T.accentText }}>
            {polishing ? (
              <>
                <LoaderCircle size={13} style={{ animation: 'cc-spin 1s linear infinite' }} /> Polishing your dictation…
              </>
            ) : (
              <>
                <Sparkles size={13} strokeWidth={2.5} /> Polished from your dictation
                <button type="button" onClick={undoPolish} style={{ fontWeight: 600, color: T.ink70, textDecoration: 'underline' }}>Undo</button>
              </>
            )}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <button
            type="button"
            onClick={toggleMic}
            disabled={!supported}
            aria-pressed={listening}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px 8px 11px', borderRadius: T.rPill, background: listening ? T.accent : T.accentSoft, color: listening ? '#fff' : T.accentText, fontWeight: 600, fontSize: 13.5, opacity: supported ? 1 : 0.5 }}
          >
            {listening ? <Square size={15} strokeWidth={2.5} fill="#fff" /> : <Mic size={16} strokeWidth={2.25} />}
            {listening ? 'Recording…' : supported ? 'Record' : 'Type your note'}
          </button>
          {transcript.trim() && !listening ? (
            <button type="button" onClick={polish} disabled={polishing} title="Clean it up into polished writing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: T.accentText, opacity: polishing ? 0.5 : 1 }}>
              <Wand2 size={14} strokeWidth={2.25} /> {polished ? 'Re-polish' : 'Polish'}
            </button>
          ) : (
            <span style={{ fontSize: 11.5, color: T.ink40, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Keyboard size={13} /> or just type
            </span>
          )}
        </div>
      </div>

      {/* category + tone */}
      <Eyebrow style={{ margin: '20px 0 8px' }}>{brand.categoryLabel}</Eyebrow>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {brand.categories.map((sp) => (
          <SelectChip key={sp.id} active={sport === sp.id} onClick={() => setSport(sp.id)}>
            <sp.Icon size={14} strokeWidth={2.25} color={sport === sp.id ? T.accent : T.ink40} />
            {sp.label}
          </SelectChip>
        ))}
      </div>

      <Eyebrow style={{ margin: '20px 0 8px' }}>Voice</Eyebrow>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {TONES.map((t) => (
          <SelectChip key={t.id} active={tone === t.id} onClick={() => setTone(t.id)}>
            {t.label}
          </SelectChip>
        ))}
      </div>
    </Screen>
  );
}
