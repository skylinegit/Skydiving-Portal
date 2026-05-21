'use client';

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiMode, getMe, logout as apiLogout } from '@/lib/api';
import type { SessionUser } from '@/types';

// Client-side session helpers.
//
// In REAL mode (NEXT_PUBLIC_API_BASE_URL set), the session is an HTTP-only
// cookie that JS cannot read. The single source of truth is a `GET /me`
// probe. To avoid every consumer firing its own /me request, a single
// SessionProvider does the fetch once and shares the result via context.
//
// In MOCK mode, the same provider falls back to a localStorage-backed
// pseudo-session so the app is usable without a running backend.

const MOCK_STORAGE_KEY = 'skyline_portal_session';
const MOCK_TTL_HOURS = 24;

export interface ClientSession {
  email: string;
  displayName?: string;
  loggedInAt: number;
}

interface SessionContextValue {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// ---------------------------------------------------------------------------
// Mock-mode localStorage helpers
// ---------------------------------------------------------------------------

interface MockSessionEntry {
  email: string;
  loggedInAt: number;
}

function readMockSession(): MockSessionEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MockSessionEntry;
    const ageMs = Date.now() - parsed.loggedInAt;
    if (ageMs > MOCK_TTL_HOURS * 60 * 60 * 1000) {
      window.localStorage.removeItem(MOCK_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearMockSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(MOCK_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Wrap any subtree that needs to know about the current user.
 *
 * Fetches `GET /me` once on mount and exposes the result via context. Every
 * `useSession()` / `useCurrentUser()` consumer beneath the provider reads
 * the same shared state — no duplicate fetches per component.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (apiMode === 'mock') {
      const mock = readMockSession();
      if (mock) {
        try {
          // getMe() in mock mode returns the in-memory MOCK_USER
          setUser(await getMe());
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      return;
    }

    try {
      setUser(await getMe());
    } catch {
      // 401 means no/expired session — that's the "logged out" state, not an error.
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<SessionContextValue>(
    () => ({ user, loading, refresh }),
    [user, loading, refresh],
  );

  // No JSX here so this stays a .ts file (Provider is a tiny component).
  return createElement(SessionContext.Provider, { value }, children);
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Legacy/lightweight session view. Returns just email + display name plus a
 * loading flag — keeps the existing `Header` and `UserMenu` callers unchanged.
 *
 * Outside a SessionProvider this returns safe defaults rather than throwing,
 * so unauthenticated pages (login, etc.) can still call it without
 * needing the provider in their tree.
 */
export function useSession(): { session: ClientSession | null; loading: boolean } {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    return { session: null, loading: false };
  }
  const session: ClientSession | null = ctx.user
    ? {
        email: ctx.user.account.email,
        displayName: ctx.user.account.displayName,
        loggedInAt: Date.now(),
      }
    : null;
  return { session, loading: ctx.loading };
}

/**
 * Full user object — use when you need the profile or account details.
 * Returns null when there is no provider above or the user is signed out.
 */
export function useCurrentUser(): SessionUser | null {
  return useContext(SessionContext)?.user ?? null;
}

/**
 * Force-refresh the cached /me. Useful after a profile or email update so
 * the header and other consumers immediately show the new value.
 */
export function useSessionRefresh(): () => Promise<void> {
  const ctx = useContext(SessionContext);
  return ctx?.refresh ?? (async () => undefined);
}

// ---------------------------------------------------------------------------
// Imperative helpers (used by pages that don't need the hook)
// ---------------------------------------------------------------------------

/**
 * Synchronous read of the cached mock session.
 * - Mock mode: returns the localStorage entry.
 * - Real mode: always null (HTTP-only cookies are unreadable from JS).
 *   Prefer `useSession()` / `useCurrentUser()` in real mode.
 */
export function getSession(): ClientSession | null {
  if (apiMode === 'real') return null;
  const mock = readMockSession();
  return mock ? { email: mock.email, loggedInAt: mock.loggedInAt } : null;
}

/**
 * Legacy mock-only helper. Real-mode login is handled by the backend's
 * HTTP-only cookie set by POST /auth/login. Kept for any call site that
 * still references it.
 */
export function loginMock(email: string): void {
  if (apiMode === 'real') return;
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      MOCK_STORAGE_KEY,
      JSON.stringify({ email, loggedInAt: Date.now() }),
    );
  } catch {
    // ignore
  }
}

/**
 * End the session. In real mode, calls POST /auth/logout so the backend
 * deletes the session row and tells the browser to drop the cookie. In mock
 * mode, just clears localStorage.
 */
export async function logout(): Promise<void> {
  try {
    await apiLogout();
  } finally {
    clearMockSession();
  }
}
