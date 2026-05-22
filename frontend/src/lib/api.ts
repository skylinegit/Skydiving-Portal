import type { BookingDetails, SessionUser, UserProfile, Sex, Venue } from '@/types';
import { MOCK_BOOKING, MOCK_USER, MOCK_VENUES } from '@/lib/mock-data';

// Typed API client. When NEXT_PUBLIC_API_BASE_URL is set, auth + /me hit the
// real FastAPI backend (auth/router.py and users/router.py). Without the env
// var, everything falls back to mocks so local dev works without the backend
// running.
//
// Booking/profile/venue/dates endpoints stay mocked until their backend
// routes are built — they will be flipped one by one as they ship.

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');
const USE_REAL_BACKEND = API_BASE_URL !== '';

const MOCK_SESSION_KEY = 'skyline_portal_session';
const MIN_DELAY_MS = 250;
const MAX_DELAY_MS = 600;

function delay(ms = randomDelay()): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

let mockUser: SessionUser = MOCK_USER;
let mockBooking: BookingDetails = MOCK_BOOKING;

export interface ApiError {
  code: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Backend client (real mode)
// ---------------------------------------------------------------------------

interface BackendUser {
  user_id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  dob: string | null;
  gender: string | null;
  phone_number: string | null;
  address_1: string | null;
  address_2: string | null;
  town: string | null;
  county: string | null;
  postcode: string | null;
  height_cm: string | number | null;
  weight_kg: string | number | null;
  fundraising_url: string | null;
  terms_agreed_at: string | null;
}

async function apiFetch<T = unknown>(path: string, opts: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const hasBody = opts.body !== undefined && opts.body !== null;
  const res = await fetch(url, {
    // Always bypass HTTP caches. The portal's GETs (e.g. /me, /bookings/me)
    // must reflect the latest writes immediately after PATCH/POST, and
    // without this the browser was returning a stale /me body on reload.
    cache: 'no-store',
    ...opts,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...opts.headers,
    },
  });

  if (!res.ok) {
    let detail: string | undefined;
    try {
      const json = (await res.json()) as { detail?: unknown };
      if (typeof json.detail === 'string') detail = json.detail;
    } catch {
      // body not JSON; ignore
    }
    const err: ApiError = {
      code: `http_${res.status}`,
      message: detail ?? res.statusText ?? 'Request failed',
    };
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function asProfileNumber(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  return typeof v === 'string' ? Number.parseFloat(v) || 0 : v;
}

function backendUserToProfile(u: BackendUser): UserProfile {
  const allowedSex: ReadonlyArray<Sex> = ['male', 'female', 'prefer-not-to-say'];
  const sex: Sex = allowedSex.includes((u.gender ?? '') as Sex)
    ? ((u.gender ?? 'prefer-not-to-say') as Sex)
    : 'prefer-not-to-say';
  return {
    phone: u.phone_number ?? '',
    dob: u.dob ?? '',
    sex,
    fundraisingUrl: u.fundraising_url,
    heightCm: asProfileNumber(u.height_cm),
    weightKg: asProfileNumber(u.weight_kg),
    termsAccepted: u.terms_agreed_at != null,
  };
}

function backendUserToSession(u: BackendUser): SessionUser {
  const displayName =
    [u.first_name, u.last_name].filter(Boolean).join(' ').trim() ||
    u.email.split('@')[0] ||
    'Jumper';

  return {
    account: {
      id: String(u.user_id),
      email: u.email,
      displayName,
      pendingEmailChange: null,
    },
    profile: backendUserToProfile(u),
  };
}

// ---------------------------------------------------------------------------
// Mock session bookkeeping (used when USE_REAL_BACKEND is false)
// ---------------------------------------------------------------------------

function writeMockSession(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      MOCK_SESSION_KEY,
      JSON.stringify({ email, loggedInAt: Date.now() }),
    );
  } catch {
    // localStorage disabled / quota — ignore.
  }
}

function clearMockSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(MOCK_SESSION_KEY);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------

export async function login(email: string, password: string): Promise<SessionUser> {
  if (USE_REAL_BACKEND) {
    // /auth/login returns the full UserPublic so there is no need for a
    // follow-up GET /me round-trip here. The cookie is set on this response.
    const me = await apiFetch<BackendUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return backendUserToSession(me);
  }

  await delay();
  mockUser = { ...mockUser, account: { ...mockUser.account, email } };
  writeMockSession(email);
  return mockUser;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bookingReference: string;
}

export async function register(input: RegisterPayload): Promise<SessionUser> {
  if (USE_REAL_BACKEND) {
    // /auth/register returns the full UserPublic and sets the session cookie
    // so the caller can drop the user straight into the portal.
    const me = await apiFetch<BackendUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        booking_reference: input.bookingReference,
        first_name: input.firstName,
        last_name: input.lastName,
      }),
    });
    return backendUserToSession(me);
  }

  // Mock mode: pretend it worked and seed a session so the portal renders.
  await delay();
  const displayName = `${input.firstName} ${input.lastName}`.trim() || 'Jumper';
  mockUser = {
    ...mockUser,
    account: { ...mockUser.account, email: input.email, displayName },
  };
  writeMockSession(input.email);
  return mockUser;
}

export async function logout(): Promise<void> {
  if (USE_REAL_BACKEND) {
    await apiFetch('/auth/logout', { method: 'POST' });
    return;
  }
  await delay(120);
  clearMockSession();
}

export async function forgotPassword(email: string): Promise<{ sent: boolean }> {
  if (USE_REAL_BACKEND) {
    await apiFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { sent: true };
  }
  await delay();
  return { sent: true };
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ ok: true }> {
  if (USE_REAL_BACKEND) {
    await apiFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    return { ok: true };
  }
  await delay();
  return { ok: true };
}

// In-flight deduplication for GET /me. React Strict Mode double-fires every
// useEffect in dev, and HMR can remount components. Without this, every
// SessionProvider mount triggered a fresh /me. Now concurrent callers share
// the same Promise — only one network request goes out.
let pendingMe: Promise<SessionUser> | null = null;

export async function getMe(): Promise<SessionUser> {
  if (USE_REAL_BACKEND) {
    if (pendingMe) return pendingMe;
    pendingMe = apiFetch<BackendUser>('/me')
      .then(backendUserToSession)
      .finally(() => {
        // Clear after a tick so subsequent (non-concurrent) calls still hit
        // the network — we only collapse calls that overlap in time.
        setTimeout(() => {
          pendingMe = null;
        }, 0);
      });
    return pendingMe;
  }
  await delay();
  return mockUser;
}

export async function changePassword(
  current: string,
  next: string,
): Promise<{ ok: true }> {
  if (USE_REAL_BACKEND) {
    await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: current, new_password: next }),
    });
    return { ok: true };
  }
  await delay();
  return { ok: true };
}

export async function changeEmail(newEmail: string): Promise<{ pendingEmail: string }> {
  if (USE_REAL_BACKEND) {
    await apiFetch('/auth/change-email', {
      method: 'POST',
      body: JSON.stringify({ new_email: newEmail }),
    });
    return { pendingEmail: newEmail };
  }
  await delay();
  mockUser = {
    ...mockUser,
    account: { ...mockUser.account, pendingEmailChange: newEmail },
  };
  return { pendingEmail: newEmail };
}

export async function logOutOtherSessions(): Promise<{ ok: true }> {
  if (USE_REAL_BACKEND) {
    await apiFetch('/auth/logout-others', { method: 'POST' });
    return { ok: true };
  }
  await delay();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function updateProfile(input: Partial<UserProfile>): Promise<UserProfile> {
  if (USE_REAL_BACKEND) {
    // Send only the fields the caller actually set. The backend's
    // UserProfileUpdate accepts camelCase via Pydantic alias_generator, so
    // the frontend's snake_case Sex/etc. map cleanly.
    const body: Record<string, unknown> = {};
    if (input.phone !== undefined) body.phone = input.phone;
    if (input.dob !== undefined) body.dob = input.dob;
    if (input.sex !== undefined) body.sex = input.sex;
    if (input.fundraisingUrl !== undefined) body.fundraisingUrl = input.fundraisingUrl;
    if (input.heightCm !== undefined) body.heightCm = input.heightCm;
    if (input.weightKg !== undefined) body.weightKg = input.weightKg;
    if (input.termsAccepted !== undefined) body.termsAccepted = input.termsAccepted;

    const updated = await apiFetch<BackendUser>('/me/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return backendUserToProfile(updated);
  }

  await delay();
  mockUser = { ...mockUser, profile: { ...mockUser.profile, ...input } };
  return mockUser.profile;
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

interface BackendBooking {
  bookingDate: string;
  bookingRef: string;
  charity: string;
  status: string;
  venueId: string;
  venueName: string;
  date1: string;
  date2: string | null;
  jumpCost: string | number;
  fundraisingMinimum: string | number | null;
  amountRaised: string | number;
  isCharityJump: boolean;
  hasPaid: boolean;
  venueChangeRequest: {
    status: 'editable' | 'pending';
    requested: { venueId: string; venueName: string } | null;
  };
  datesChangeRequest: {
    status: 'editable' | 'pending';
    requested: { date1: string; date2: string | null } | null;
  };
}

function asNumber(v: string | number | null | undefined, fallback = 0): number {
  if (v === null || v === undefined) return fallback;
  return typeof v === 'string' ? Number.parseFloat(v) || fallback : v;
}

function backendBookingToDetails(b: BackendBooking): BookingDetails {
  const allowedStatus: ReadonlyArray<BookingDetails['status']> = [
    'confirmed',
    'pending',
    'cancelled',
    'completed',
  ];
  const normalisedStatus: BookingDetails['status'] = allowedStatus.includes(
    b.status as BookingDetails['status'],
  )
    ? (b.status as BookingDetails['status'])
    : 'confirmed';

  return {
    bookingDate: b.bookingDate,
    bookingRef: b.bookingRef,
    charity: b.charity,
    status: normalisedStatus,
    venueId: b.venueId,
    venueName: b.venueName,
    date1: b.date1,
    date2: b.date2,
    jumpCost: asNumber(b.jumpCost),
    fundraisingMinimum:
      b.fundraisingMinimum != null ? asNumber(b.fundraisingMinimum) : null,
    amountRaised: asNumber(b.amountRaised),
    isCharityJump: b.isCharityJump,
    hasPaid: b.hasPaid,
    venueChangeRequest:
      b.venueChangeRequest.status === 'pending' && b.venueChangeRequest.requested
        ? { status: 'pending', requested: b.venueChangeRequest.requested }
        : { status: 'editable' },
    datesChangeRequest:
      b.datesChangeRequest.status === 'pending' && b.datesChangeRequest.requested
        ? { status: 'pending', requested: b.datesChangeRequest.requested }
        : { status: 'editable' },
  };
}

export async function getBooking(): Promise<BookingDetails> {
  if (USE_REAL_BACKEND) {
    const data = await apiFetch<BackendBooking>('/bookings/me');
    return backendBookingToDetails(data);
  }
  await delay();
  return mockBooking;
}

// ---------------------------------------------------------------------------
// Venues
// ---------------------------------------------------------------------------

interface BackendVenue {
  id: number;
  name: string;
  slug: string;
  region: string | null;
}

export async function getVenues(): Promise<Venue[]> {
  if (USE_REAL_BACKEND) {
    const data = await apiFetch<BackendVenue[]>('/venues');
    return data.map((v) => ({ id: v.id, slug: v.slug, name: v.name, region: v.region }));
  }
  await delay();
  return MOCK_VENUES;
}

export async function requestVenueChange(
  newVenueId: number,
  newVenueSlug: string,
  newVenueName: string,
): Promise<BookingDetails> {
  if (USE_REAL_BACKEND) {
    const data = await apiFetch<BackendBooking>('/bookings/me/venue-change-request', {
      method: 'POST',
      body: JSON.stringify({ new_venue_id: newVenueId }),
    });
    return backendBookingToDetails(data);
  }
  await delay();
  mockBooking = {
    ...mockBooking,
    venueChangeRequest: {
      status: 'pending',
      requested: { venueId: newVenueSlug, venueName: newVenueName },
    },
  };
  return mockBooking;
}

export async function requestDatesChange(
  date1: string,
  date2: string | null,
): Promise<BookingDetails> {
  if (USE_REAL_BACKEND) {
    const data = await apiFetch<BackendBooking>('/bookings/me/dates-change-request', {
      method: 'POST',
      body: JSON.stringify({ date1, date2 }),
    });
    return backendBookingToDetails(data);
  }
  await delay();
  mockBooking = {
    ...mockBooking,
    datesChangeRequest: {
      status: 'pending',
      requested: { date1, date2 },
    },
  };
  return mockBooking;
}

// Exposed so other modules can introspect the runtime mode (rare).
export const apiMode = USE_REAL_BACKEND ? 'real' : 'mock';
