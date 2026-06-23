// Auth seam. Phase 1: a demo, in-memory sign-in. The form is validated and a user
// object is set, but there is no real credential check and nothing leaves the device.
//
// Phase 2 replaces ONLY the internals of this file (e.g. Clerk or Supabase Google
// sign-in). Components keep calling useAuth() and never learn whether auth is real
// or stubbed.
import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const SESSION_KEY = 'coachcast.session.v1';

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

function nameFromEmail(email) {
  const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
  return local
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ') || 'Coach';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession);

  const signIn = useCallback(({ email, password }) => {
    // Demo validation only — mirrors the prototype. No real auth in phase 1.
    const trimmed = (email || '').trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!valid) return { ok: false, error: 'Enter a valid email address.' };
    if (!password || password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' };
    }
    const u = { email: trimmed, name: nameFromEmail(trimmed) };
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
    } catch {
      // ignore
    }
    setUser(u);
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with provider by design (the seam)
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
