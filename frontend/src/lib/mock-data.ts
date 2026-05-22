import type { BookingDetails, SessionUser, Venue } from '@/types';

export const MOCK_VENUES: Venue[] = [
  { id: 1, slug: 'headcorn', name: 'Headcorn', region: 'Kent' },
  { id: 2, slug: 'old-sarum', name: 'Old Sarum', region: 'Wiltshire' },
  { id: 3, slug: 'maidstone', name: 'Maidstone', region: 'Kent' },
  { id: 4, slug: 'beccles', name: 'Beccles', region: 'Suffolk' },
  { id: 5, slug: 'hibaldstow', name: 'Hibaldstow', region: 'Lincolnshire' },
  { id: 6, slug: 'salisbury', name: 'Salisbury', region: 'Wiltshire' },
];

export const MOCK_USER: SessionUser = {
  account: {
    id: 'usr_dominic_carolan',
    email: 'dominic@skylineevents.co.uk',
    displayName: 'Dominic Carolan',
    pendingEmailChange: null,
  },
  profile: {
    phone: '07803621379',
    dob: '2010-12-15',
    sex: 'male',
    fundraisingUrl: null,
    heightCm: 188,
    weightKg: 76.2,
    termsAccepted: true,
  },
};

export const MOCK_BOOKING: BookingDetails = {
  bookingDate: '2025-11-12',
  bookingRef: '24087482',
  charity: 'Skyline',
  status: 'confirmed',
  venueId: 'headcorn',
  venueName: 'Headcorn',
  date1: '2026-06-02',
  date2: '2026-06-24',
  jumpCost: 299,
  fundraisingMinimum: 395,
  amountRaised: 245,
  isCharityJump: false,
  hasPaid: false,
  venueChangeRequest: { status: 'editable' },
  datesChangeRequest: { status: 'editable' },
};
