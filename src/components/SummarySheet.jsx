import { useState, useEffect } from 'react';
import { X, Copy, Check, LoaderCircle, Sparkles } from 'lucide-react';
import { T, space, sportById } from '../lib/sports';
import { fmtDate } from '../lib/format';
import { summarizeAthlete } from '../lib/api';
import { useBrand } from '../auth/BrandContext';
import { IconButton } from './ui';

// Bottom sheet: a parent-facing progress summary across the athlete's recent recaps.
export default function SummarySheet({ athlete, onClose }) {
  const { brand } = useBrand();
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await summarizeAthlete({
          mode: brand.id,
          sport: athlete.sport,
          athlete: { firstName: athlete.name.split(' ')[0], age: athlete.age },
          recaps: athlete.recaps.slice(0, 8).map((r) => ({
            headline: r.headline,
            parentMessage: r.parentMessage,
            date: fmtDate(r.createdAt),
          })),
        });
        if (alive) setState({ loading: false, error: '', data });
      } catch {
        if (alive) setState({ loading: false, error: "Couldn't write the summary. Check your connection and try again.", data: null });
      }
    })();
    return () => { alive = false; };
  }, [athlete, brand.id]);

  const copy = async () => {
    if (!state.data) return;
    try {
      await navigator.clipboard.writeText(state.data.summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  const s = sportById(athlete.sport);

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
          maxHeight: '82%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: T.ink40 }}>
            <Sparkles size={13} color={T.accent} /> Progress summary
          </span>
          <IconButton label="Close" onClick={onClose} style={{ marginRight: -6 }}>
            <X size={20} />
          </IconButton>
        </div>
        <div style={{ fontSize: 12.5, color: T.ink40, marginBottom: 14 }}>
          {athlete.name.split(' ')[0]} · {s.label} · {athlete.recaps.length} recaps
        </div>

        <div className="cc-scroll" style={{ overflowY: 'auto' }}>
          {state.loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '24px 4px', color: T.ink40, fontSize: 14 }}>
              <LoaderCircle size={18} style={{ animation: 'cc-spin 1s linear infinite', color: T.accent }} />
              Reading {athlete.name.split(' ')[0]}'s recent sessions…
            </div>
          )}

          {state.error && (
            <div role="alert" style={{ padding: '18px 4px', color: T.accentText, fontSize: 13.5, fontWeight: 600 }}>
              {state.error}
            </div>
          )}

          {state.data && (
            <>
              <h3 style={{ fontFamily: space.display, fontWeight: 700, fontSize: 21, letterSpacing: '-.01em', marginBottom: 10 }}>
                {state.data.headline}
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: T.ink70, whiteSpace: 'pre-wrap' }}>{state.data.summary}</p>
              <button
                onClick={copy}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  marginTop: 16,
                  padding: '10px 14px',
                  borderRadius: T.r,
                  border: `1px solid ${T.line}`,
                  background: T.surface,
                  color: copied ? T.accentText : T.ink,
                  fontWeight: 600,
                  fontSize: 13.5,
                }}
              >
                {copied ? <Check size={15} strokeWidth={2.5} color={T.accent} /> : <Copy size={15} strokeWidth={2.25} />}
                {copied ? 'Copied' : 'Copy summary'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
