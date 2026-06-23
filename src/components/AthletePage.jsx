import { useState } from 'react';
import { Mic, Check, Target, CheckCheck, MessageCircle, Sparkles } from 'lucide-react';
import { T, space, sportById } from '../lib/sports';
import { fmtFullDate, relativeDate } from '../lib/format';
import { Avatar, PrimaryButton, Eyebrow } from './ui';
import Screen from './Screen';
import SummarySheet from './SummarySheet';

function TagRow({ icon, items, color }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {items.map((t, i) => (
        <span
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 11.5,
            fontWeight: 600,
            color: color,
            background: T.surfaceAlt,
            border: `1px solid ${T.line}`,
            borderRadius: 999,
            padding: '4px 9px',
          }}
        >
          {icon}
          {t}
        </span>
      ))}
    </div>
  );
}

function RecapCard({ recap, index }) {
  return (
    <div
      className="cc-anim-up"
      style={{
        animationDelay: `${Math.min(index * 50, 200)}ms`,
        background: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: T.r,
        padding: 15,
        boxShadow: T.shadowSoft,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.ink40 }}>{fmtFullDate(recap.createdAt)}</span>
        <span style={{ fontSize: 11.5, color: T.ink40, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <CheckCheck size={13} color={T.accent} strokeWidth={2.5} /> Sent
        </span>
      </div>
      <h3
        style={{
          fontFamily: space.display,
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: '-.01em',
          margin: '6px 0 0',
        }}
      >
        {recap.headline}
      </h3>

      <TagRow
        icon={<Check size={11} strokeWidth={3} color={T.accent} />}
        items={recap.workedOn}
        color={T.ink70}
      />
      <TagRow
        icon={<Target size={11} strokeWidth={2.5} color={T.accent} />}
        items={recap.nextFocus}
        color={T.ink70}
      />

      <div
        style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${T.line}`,
          display: 'flex',
          gap: 8,
        }}
      >
        <MessageCircle size={14} color={T.ink40} style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: T.ink70 }}>{recap.parentMessage}</p>
      </div>
    </div>
  );
}

export default function AthletePage({ athlete, onBack, onNewRecap }) {
  const s = sportById(athlete.sport);
  const Icon = s.Icon;
  const [summarizing, setSummarizing] = useState(false);

  return (
    <Screen
      title=""
      onBack={onBack}
      footer={
        <PrimaryButton onClick={onNewRecap}>
          <Mic size={17} strokeWidth={2.25} />
          New recap
        </PrimaryButton>
      }
    >
      {/* athlete header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        <Avatar name={athlete.name} size={56} />
        <div>
          <h2 style={{ fontFamily: space.display, fontWeight: 700, fontSize: 23, letterSpacing: '-.02em' }}>
            {athlete.name}
          </h2>
          <div style={{ fontSize: 13, color: T.ink40, display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Icon size={13} color={T.accent} strokeWidth={2.25} /> {s.label} · Age {athlete.age}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          margin: '14px 0 20px',
          padding: '12px 14px',
          borderRadius: T.r,
          background: T.surfaceAlt,
          border: `1px solid ${T.line}`,
        }}
      >
        <Stat value={athlete.recaps.length} label={athlete.recaps.length === 1 ? 'recap sent' : 'recaps sent'} />
        <div style={{ width: 1, background: T.line }} />
        <Stat
          value={athlete.recaps[0] ? relativeDate(athlete.recaps[0].createdAt) : '—'}
          label="last session"
        />
      </div>

      {athlete.recaps.length >= 2 && (
        <button
          onClick={() => setSummarizing(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textAlign: 'left',
            padding: '12px 14px',
            borderRadius: T.r,
            background: T.accentSoft,
            border: `1px solid ${T.accentSoft2}`,
            marginBottom: 18,
          }}
        >
          <Sparkles size={18} color={T.accent} strokeWidth={2.25} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontWeight: 600, fontSize: 14, color: T.accentText }}>Summarize progress</span>
            <span style={{ display: 'block', fontSize: 12, color: T.ink40 }}>
              One parent-ready recap across {athlete.name.split(' ')[0]}'s recent sessions
            </span>
          </span>
        </button>
      )}

      <Eyebrow style={{ marginBottom: 10 }}>Progress timeline</Eyebrow>

      {athlete.recaps.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 20px',
            color: T.ink40,
            fontSize: 14,
            border: `1px dashed ${T.lineStrong}`,
            borderRadius: T.r,
          }}
        >
          No recaps yet. After your next session, tap <strong style={{ color: T.ink70 }}>New recap</strong> to send the first one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {athlete.recaps.map((r, i) => (
            <RecapCard key={r.id} recap={r} index={i} />
          ))}
        </div>
      )}

      {summarizing && <SummarySheet athlete={athlete} onClose={() => setSummarizing(false)} />}
    </Screen>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontFamily: space.display, fontWeight: 700, fontSize: 18, color: T.ink, letterSpacing: '-.01em' }}>
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: T.ink40 }}>{label}</div>
    </div>
  );
}
