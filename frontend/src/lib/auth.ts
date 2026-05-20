'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'skyline_portal_session';
const SESSION_TTL_HOURS = 24;

interface ClientSession {
  email: string;
  loggedInAt: number;
}

function readSession(): ClientSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClientSession;
    const ageMs = Date.now() - parsed.loggedInAt;
    if (ageMs > SESSION_TTL_HOURS * 60 * 60 * 1000) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: ClientSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getSession(): ClientSession | null {
  return readSession();
}

export function loginMock(email: string): void {
  writeSession({ email, loggedInAt: Date.now() });
}

export function logout(): void {
  clearSession();
}

export function useSession(): { session: ClientSession | null; loading: boolean } {
  const [session, setSession] = useState<ClientSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(readSession());
    setLoading(false);
  }, []);

  return { session, loading };
}
