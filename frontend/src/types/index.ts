export type Sex = 'male' | 'female' | 'prefer-not-to-say';

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  pendingEmailChange: string | null;
}

export interface UserProfile {
  phone: string;
  dob: string;
  sex: Sex;
  fundraisingUrl: string | null;
  heightCm: number;
  weightKg: number;
  termsAccepted: boolean;
}

export type ChangeRequestState<T> = { status: 'editable' } | { status: 'pending'; requested: T };

export interface BookingDetails {
  bookingDate: string;
  bookingRef: string;
  charity: string;
  status: BookingStatus;
  venueId: string;
  venueName: string;
  date1: string;
  date2: string | null;
  jumpCost: number;
  fundraisingMinimum: number | null;
  amountRaised: number;
  isCharityJump: boolean;
  hasPaid: boolean;
  venueChangeRequest: ChangeRequestState<{ venueId: string; venueName: string }>;
  datesChangeRequest: ChangeRequestState<{ date1: string; date2: string | null }>;
}

export interface Venue {
  id: string;
  name: string;
  region: string;
}

export interface AirfieldSection {
  heading: string;
  paragraphs: string[];
}

export interface AirfieldContent {
  id: string;
  name: string;
  region: string;
  address: string;
  postcode: string;
  phone: string;
  weightLimitKg: number;
  weightSurchargeNote: string | null;
  intro: string;
  importantNotes: string[];
  sections: AirfieldSection[];
  facilities: string[];
  mapEmbedUrl: string;
}

export interface SessionUser {
  account: UserAccount;
  profile: UserProfile;
}
