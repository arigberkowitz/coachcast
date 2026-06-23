import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Square, Sparkles, LoaderCircle, Keyboard, FileText, Wand2 } from 'lucide-react';
import { T, TONES, sportById } from '../lib/sports';
import { generateRecap, polishNote, errorMessage } from '../lib/api';
import { useSpeech } from '../lib/useSpeech';
import { useBrand } from '../auth/BrandContext';
import { Avatar, SelectChip, PrimaryButton, GhostButton, Eyebrow } from './ui';
import Screen from './Screen';

export default function Capture({ athlete, initial, onBack, onGenerated, onSaveNote }) {
  const { brand } = useBrand();
  const [transcript, setTranscript] = useState(initial?.transcript || '');
  const [sport, setSport] = useState(initial?.sport || athlete.sport);
  const [tone, setTone] = useState(initial?.tone || 'warm');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [polishing, setPolishing] = useState(false);
  const [polished, setPolished] = useState(false);
  const [rawBackup, setRawBackup] = useState(null);

  const { supported, listening, interim, start, stop } = useSpeech({
    onFinal: (chunk) =>
      setTranscript((t) => (t ? `${t} ${chunk}` : chunk).replace(/\s+/g, ' ')),
  });

  // Keep the latest transcript in a ref so the auto-polish timer reads fresh text.
  const transcriptRef = useRef(transcript);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Clean a rough/dictated note into polished writing (Wispr-style). Reversible.
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

  // Auto-polish once after the user explicitly stops recording (the Wispr moment).
  const prevListening = useRef(false);
  const userStopped = useRef(false);
  useEffect(() => {
    const was = prevListening.current;
    prevListening.current = listening;
    if (was && !listening && userStopped.current) {
      userStopped.current = false;
      const id = setTimeout(() => polish(), 350); // let the final speech chunk land
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
      const recap = await generateRecap({ mode: brand.id, sport, tone, athlete, transcript });
      onGenerated(recap, { sport, tone, transcript: transcript.trim() });
    } catch (e) {
      setError(errorMessage(e, "Couldn't write the recap. Please try again in a moment."));
    } finally {
      setLoading(false);
    }
  };

  const s = sportById(athlete.sport);

  return (
    <Screen
      title="New recap"
      onBack={onBack}
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {error && (
            <div role="alert" style={{ color: T.accentText, fontSize: 13, fontWeight: 600, marginBottom: 1, textAlign: 'center' }}>
              {error}
            </div>
          )}
          <PrimaryButton disabled={!transcript.trim() || loading || polishing} onClick={generate}>
            {loading ? (
              <>
                <LoaderCircle size={17} strokeWidth={2.5} style={{ animation: 'cc-spin 1s linear infinite' }} />
                Writing the recap…
              </>
            ) : (
              <>
                <Sparkles size={17} strokeWidth={2.25} />
                Generate recap
              </>
            )}
          </PrimaryButton>
          {onSaveNote && (
            <GhostButton
              style={{ width: '100%' }}
              disabled={!transcript.trim() || loading || polishing}
              onClick={() => {
                if (!transcript.trim()) return;
                if (listening) stop();
                onSaveNote({ sport, tone, transcript: transcript.trim() });
              }}
            >
              <FileText size={15} strokeWidth={2.25} />
              Save note as draft
            </GhostButton>
          )}
        </div>
      }
    >
      {/* athlete header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
        <Avatar name={athlete.name} size={40} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 15.5 }}>{athlete.name}</div>
          <div style={{ fontSize: 12.5, color: T.ink40 }}>Age {athlete.age} · {s.label}</div>
        </div>
      </div>

      {/* note capture */}
      <Eyebrow style={{ marginBottom: 8 }}>Your session note</Eyebrow>
      <div
        style={{
          borderRadius: T.r,
          border: `1.5px solid ${listening ? T.accent : T.line}`,
          background: T.surface,
          padding: 14,
          transition: 'border-color .15s ease',
        }}
      >
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="What did you work on today? Talk or type — a few rough lines is plenty."
          rows={5}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 15,
            lineHeight: 1.55,
            color: T.ink,
          }}
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
                <button type="button" onClick={undoPolish} style={{ fontWeight: 600, color: T.ink70, textDecoration: 'underline' }}>
                  Undo
                </button>
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
            title={supported ? (listening ? 'Stop recording' : 'Record') : 'Voice input not supported here — type your note'}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px 8px 11px',
              borderRadius: T.rPill,
              background: listening ? T.accent : T.accentSoft,
              color: listening ? '#fff' : T.accentText,
              fontWeight: 600,
              fontSize: 13.5,
              opacity: supported ? 1 : 0.5,
            }}
          >
            {listening && (
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  left: 14,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,.5)',
                  animation: 'cc-pulse-ring 1.5s ease-out infinite',
                }}
              />
            )}
            {listening ? <Square size={15} strokeWidth={2.5} fill="#fff" /> : <Mic size={16} strokeWidth={2.25} />}
            {listening ? 'Recording…' : supported ? 'Record' : 'Type your note'}
          </button>
          {transcript.trim() && !listening ? (
            <button
              type="button"
              onClick={polish}
              disabled={polishing}
              title="Clean it up into polished writing"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: T.accentText, opacity: polishing ? 0.5 : 1 }}
            >
              <Wand2 size={14} strokeWidth={2.25} /> {polished ? 'Re-polish' : 'Polish'}
            </button>
          ) : (
            <span style={{ fontSize: 11.5, color: T.ink40, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Keyboard size={13} /> or just type
            </span>
          )}
        </div>
      </div>

      {/* category (sport or subject) */}
      <Eyebrow style={{ margin: '20px 0 8px' }}>{brand.categoryLabel}</Eyebrow>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {brand.categories.map((sp) => (
          <SelectChip key={sp.id} active={sport === sp.id} onClick={() => setSport(sp.id)}>
            <sp.Icon size={14} strokeWidth={2.25} color={sport === sp.id ? T.accent : T.ink40} />
            {sp.label}
          </SelectChip>
        ))}
      </div>

      {/* tone */}
      <Eyebrow style={{ margin: '20px 0 8px' }}>Voice</Eyebrow>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {TONES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTone(t.id)}
            aria-pressed={tone === t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              padding: '11px 14px',
              borderRadius: T.r,
              border: `1.5px solid ${tone === t.id ? T.accent : T.line}`,
              background: tone === t.id ? T.accentSoft : T.surface,
              transition: 'all .15s ease',
            }}
          >
            <span>
              <span style={{ display: 'block', fontWeight: 600, fontSize: 14.5, color: tone === t.id ? T.accentText : T.ink }}>
                {t.label}
              </span>
              <span style={{ fontSize: 12.5, color: T.ink40 }}>{t.hint}</span>
            </span>
            <span
              aria-hidden
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: `2px solid ${tone === t.id ? T.accent : T.lineStrong}`,
                background: tone === t.id ? T.accent : 'transparent',
                boxShadow: tone === t.id ? `inset 0 0 0 3px ${T.surface}` : 'none',
              }}
            />
          </button>
        ))}
      </div>
    </Screen>
  );
}
