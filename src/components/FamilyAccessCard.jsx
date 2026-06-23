import { useState } from 'react';
import { Share2, Copy, Check, Users } from 'lucide-react';
import { T, space } from '../lib/sports';
import { athleteCode } from '../lib/format';
import { useBrand } from '../auth/BrandContext';
import { PrimaryButton } from './ui';

// Surfaced on the athlete page so the code is easy to find. "Share with family"
// opens the native share sheet (phone) or copies a ready-to-send message.
export default function FamilyAccessCard({ athlete }) {
  const { brand } = useBrand();
  const code = athleteCode(athlete);
  const first = athlete.name.split(' ')[0];
  const [codeCopied, setCodeCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const message = `Follow ${first}'s progress on ${brand.name}. Open ${origin}, choose "I'm a parent or student," and enter code ${code}.`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${first}'s progress`, text: message });
      } catch {
        // user dismissed — no-op
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div style={{ background: T.surfaceAlt, border: `1px solid ${T.line}`, borderRadius: T.r, padding: 14, marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: T.ink40, marginBottom: 10 }}>
        <Users size={13} /> Family access
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
        <span style={{ fontFamily: space.display, fontWeight: 700, fontSize: 22, letterSpacing: '.03em', color: T.ink }}>{code}</span>
        <button
          onClick={copyCode}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: codeCopied ? T.accentText : T.ink70, border: `1px solid ${T.line}`, background: T.surface, borderRadius: 9, padding: '6px 10px' }}
        >
          {codeCopied ? <Check size={14} strokeWidth={2.5} color={T.accent} /> : <Copy size={14} strokeWidth={2.25} />}
          {codeCopied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <PrimaryButton onClick={share}>
        <Share2 size={16} strokeWidth={2.25} />
        {shared ? 'Copied — paste it to the family' : 'Share with family'}
      </PrimaryButton>

      <p style={{ fontSize: 12.5, color: T.ink40, lineHeight: 1.5, marginTop: 11 }}>
        Families open {brand.name}, choose “I'm a parent or student,” and enter this code to follow {first}'s recaps, homework, and goals — read-only.
      </p>
    </div>
  );
}
