import { Sparkles, LogOut } from 'lucide-react';
import { T, space } from '../lib/sports';
import { useAuth } from '../auth/AuthContext';
import { Avatar, IconButton } from './ui';
import { useMedia } from '../lib/useMedia';

export default function WebNav() {
  const { user, signOut } = useAuth();
  const narrow = useMedia('(max-width: 560px)');

  return (
    <header
      style={{
        height: 62,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(16px, 4vw, 32px)',
        background: 'rgba(246,241,234,.82)',
        backdropFilter: 'saturate(140%) blur(10px)',
        borderBottom: `1px solid ${T.line}`,
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: 9,
            background: T.accent,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            boxShadow: '0 6px 14px -6px rgba(255,90,44,.9)',
          }}
        >
          <Sparkles size={16} />
        </span>
        <span
          style={{
            fontFamily: space.display,
            fontWeight: 700,
            fontSize: 19,
            letterSpacing: '-.01em',
            color: T.ink,
          }}
        >
          CoachCast
        </span>
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        {!narrow && (
          <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{user.name}</div>
            <div style={{ fontSize: 11.5, color: T.ink40 }}>{user.email}</div>
          </div>
        )}
        <Avatar name={user.name} size={36} />
        <IconButton label="Sign out" onClick={signOut}>
          <LogOut size={18} strokeWidth={2} />
        </IconButton>
      </div>
    </header>
  );
}
