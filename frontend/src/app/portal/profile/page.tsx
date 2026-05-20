'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/portal/PageHeader';
import { AccountSection } from '@/components/portal/AccountSection';
import { BookingDetailsCard } from '@/components/portal/BookingDetailsCard';
import { VenueChangeField } from '@/components/portal/VenueChangeField';
import { DatesChangeField } from '@/components/portal/DatesChangeField';
import { ProfileForm } from '@/components/portal/ProfileForm';
import { getBooking, getMe } from '@/lib/api';
import type { BookingDetails, SessionUser, UserAccount, UserProfile } from '@/types';

export default function ProfilePage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [me, bk] = await Promise.all([getMe(), getBooking()]);
      if (!active) return;
      setUser(me);
      setBooking(bk);
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleAccountUpdate = (next: UserAccount) => {
    setUser((prev) => (prev ? { ...prev, account: next } : prev));
  };

  const handleProfileUpdate = (next: UserProfile) => {
    setUser((prev) => (prev ? { ...prev, profile: next } : prev));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Profile"
        title="Manage your booking"
        description="Update your account details, request changes to your booking and complete your jumper profile."
      />

      {loading || !user || !booking ? (
        <div className="space-y-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <div className="space-y-6">
          <AccountSection account={user.account} onAccountUpdate={handleAccountUpdate} />

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
