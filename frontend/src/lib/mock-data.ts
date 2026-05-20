import type { BookingDetails, SessionUser, Venue } from '@/types';

export const MOCK_VENUES: Venue[] = [
  { id: 'headcorn', name: 'Headcorn', region: 'Kent' },
  { id: 'old-sarum', name: 'Old Sarum', region: 'Wiltshire' },
  { id: 'maidstone', name: 'Maidstone', region: 'Kent' },
  { id: 'beccles', name: 'Beccles', region: 'Suffolk' },
  { id: 'hibaldstow', name: 'Hibaldstow', region: 'Lincolnshire' },
  { id: 'salisbury', name: 'Salisbury', region: 'Wiltshire' },
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
