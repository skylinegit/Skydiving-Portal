'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/portal/PageHeader';
import { BookingDetailsCard } from '@/components/portal/BookingDetailsCard';
import { VenueChangeField } from '@/components/portal/VenueChangeField';
import { DatesChangeField } from '@/components/portal/DatesChangeField';
import { ProfileForm } from '@/components/portal/ProfileForm';
import { getBooking } from '@/lib/api';
import { useCurrentUser } from '@/lib/auth';
import type { BookingDetails, UserProfile } from '@/types';

export default function ProfilePage() {
  // Shared user from SessionProvider — no extra GET /me fetch on this page.
  const ctxUser = useCurrentUser();
  // Local copy so the form widgets can optimistically apply changes.
  const [user, setUser] = useState(ctxUser);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [bookingLoading, setBookingLoading] = useState(true);

  // Sync local state when the context user changes (initial mount, refresh).
  useEffect(() => {
    setUser(ctxUser);
  }, [ctxUser]);

  useEffect(() => {
    let active = true;
    getBooking()
      .then((bk) => {
        if (active) setBooking(bk);
      })
      .catch(() => {
        if (active) setBooking(null);
      })
      .finally(() => {
        if (active) setBookingLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleProfileUpdate = (next: UserProfile) => {
    setUser((prev) => (prev ? { ...prev, profile: next } : prev));
  };

  const isLoading = bookingLoading || user == null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Booking Detail"
        title="Manage your booking"
        description="Request changes to your booking and complete your jumper profile."
      />

      {isLoading || !user || !booking ? (
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your booking details</CardTitle>
              <CardDescription>
                Read-only details synced from your Skyline booking record.
              </CardDescription>
            </CardHeader>
            <BookingDetailsCard booking={booking} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request a change</CardTitle>
              <CardDescription>
                Venue and jump-date changes are reviewed by the Skyline team. Each request can be
                submitted independently.
              </CardDescription>
            </CardHeader>
            <div className="space-y-8">
              <VenueChangeField booking={booking} onUpdate={setBooking} />
              <div className="border-t border-navy/[0.06]" />
              <DatesChangeField booking={booking} onUpdate={setBooking} />
            </div>
          </Card>

          <ProfileForm profile={user.profile} onProfileUpdate={handleProfileUpdate} />
        </div>
      )}
    </div>
  );
}
