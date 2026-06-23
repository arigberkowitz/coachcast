import { useState } from 'react';
import { Check, Copy, Mail } from 'lucide-react';
import { T, space } from '../lib/sports';
import { recapShareText } from '../lib/format';
import { useCopy } from '../lib/useCopy';
import { useBrand } from '../auth/BrandContext';
import { sendRecapEmail } from '../lib/api';
import { PrimaryButton, GhostButton } from './ui';

export default function Sent({ athlete, recap, onViewTimeline, onDone }) {
  const first = athlete.name.split(' ')[0];
  const { brand } = useBrand();
  const { copied, copy } = useCopy();

  const emailText = recapShareText(recap, brand);
  const subject = `${recap.headline} — ${first}'s update`;

  const hasEmail = !!athlete.parentEmail;
  const [sending, setSending] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [err, setErr] = useState('');

  const sendEmail = async () => {
    setSending(true);
    setErr('');
    try {
      await sendRecapEmail({ to: athlete.parentEmail, subject, text: emailText });
      setEmailed(true);
    } catch (e) {
      setErr(e.message || 'Could not send the email.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'calc(env(safe-area-inset-top, 0px) + 44px) 26px calc(env(safe-area-inset-bottom, 0px) + 22px)',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div
          className="cc-anim-pop"
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: T.accent,
            display: 'grid',
            placeItems: 'center',
            boxShadow: `0 16px 32px -12px ${T.accentGlow}`,
            animation: 'cc-pop .5s cubic-bezier(.22,.8,.3,1) backwards',
          }}
        >
          <Check size={38} strokeWidth={3} color="#fff" />
        </div>

        <h2
          className="cc-anim-up"
          style={{
            fontFamily: space.display,
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: '-.02em',
            margin: '22px 0 8px',
          }}
        >
          {emailed ? `Emailed to ${first}'s family` : 'Recap ready'}
        </h2>
        <p className="cc-anim-up" style={{ fontSize: 14.5, color: T.ink70, lineHeight: 1.55, maxWidth: 290 }}>
          “{recap.headline}” is saved to {first}'s timeline.{emailed ? '' : ' Send it to the family below.'}
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {hasEmail ? (
          <PrimaryButton onClick={sendEmail} disabled={sending || emailed}>
            {emailed ? <Check size={16} strokeWidth={2.5} /> : <Mail size={16} strokeWidth={2.25} />}
            {emailed ? 'Emailed' : sending ? 'Sending…' : `Email to ${athlete.parentEmail}`}
          </PrimaryButton>
        ) : null}

        <GhostButton style={{ width: '100%' }} onClick={() => copy(emailText)}>
          {copied ? <Check size={16} strokeWidth={2.5} color={T.accent} /> : <Copy size={16} strokeWidth={2.25} />}
          {copied ? 'Copied to clipboard' : 'Copy message to send'}
        </GhostButton>

        {err && (
          <div role="alert" style={{ fontSize: 12.5, color: T.accentText, lineHeight: 1.5, padding: '0 4px' }}>
            {err}
          </div>
        )}
        {!hasEmail && (
          <div style={{ fontSize: 12.5, color: T.ink40, lineHeight: 1.5, padding: '0 4px' }}>
            Add a parent email on {first}'s profile to send it directly from here.
          </div>
        )}

        <GhostButton style={{ width: '100%' }} onClick={onViewTimeline}>View {first}'s timeline</GhostButton>
        <GhostButton style={{ width: '100%' }} onClick={onDone}>
          Back to {brand.personPlural.toLowerCase()}
        </GhostButton>
      </div>
    </div>
  );
}
