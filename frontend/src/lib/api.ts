import type { BookingDetails, SessionUser, UserProfile } from '@/types';
import { MOCK_BOOKING, MOCK_USER } from '@/lib/mock-data';

// Mocked API client for v0. Every function returns a typed promise with a
// simulated latency so loading states behave like the real backend. When the
// FastAPI backend is ready, swap the bodies of these functions for fetch()
// calls to NEXT_PUBLIC_API_BASE_URL. The public surface should not change.

const MIN_DELAY_MS = 250;
const MAX_DELAY_MS = 600;

function delay(ms = randomDelay()): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): number {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

let currentUser: SessionUser = MOCK_USER;
let currentBooking: BookingDetails = MOCK_BOOKING;

export interface ApiError {
  code: string;
  message: string;
}

export async function login(email: string, _password: string): Promise<SessionUser> {
  await delay();
  return { ...currentUser, account: { ...currentUser.account, email } };
}

export async function forgotPassword(_email: string): Promise<{ sent: boolean }> {
  await delay();
  return { sent: true };
}

export async function resetPassword(_token: string, _password: string): Promise<{ ok: true }> {
  await delay();
  return { ok: true };
}

export async function getMe(): Promise<SessionUser> {
  await delay();
  return currentUser;
}

export async function updateProfile(input: Partial<UserProfile>): Promise<UserProfile> {
  await delay();
  currentUser = { ...currentUser, profile: { ...currentUser.profile, ...input } };
  return currentUser.profile;
}

export async function changeEmail(newEmail: string): Promise<{ pendingEmail: string }> {
  await delay();
  currentUser = {
    ...currentUser,
    account: { ...currentUser.account, pendingEmailChange: newEmail },
  };
  return { pendingEmail: newEmail };
}

export async function changePassword(
  _current: string,
  _next: string,
): Promise<{ ok: true }> {
  await delay();
  return { ok: true };
}

export async function logOutOtherSessions(): Promise<{ ok: true }> {
  await delay();
  return { ok: true };
}

export async function getBooking(): Promise<BookingDetails> {
  await delay();
  return currentBooking;
}

export async function requestVenueChange(newVenueId: string, newVenueName: string): Promise<BookingDetails> {
  await delay();
  currentBooking = {
    ...currentBooking,
    venueChangeRequest: {
      status: 'pending',
      requested: { venueId: newVenueId, venueName: newVenueName },
    },
  };
  return currentBooking;
}

export async function requestDatesChange(
  date1: string,
  date2: string | null,
): Promise<BookingDetails> {
  await delay();
  currentBooking = {
    ...currentBooking,
    datesChangeRequest: {
      status: 'pending',
      requested: { date1, date2 },
    },
  };
  return currentBooking;
}
