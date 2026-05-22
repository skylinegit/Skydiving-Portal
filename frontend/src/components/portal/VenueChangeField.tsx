'use client';

import { useEffect, useState } from 'react';
import { SelectField } from '@/components/forms/SelectField';
import { PendingChangeBanner } from './PendingChangeBanner';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { getVenues, requestVenueChange, type ApiError } from '@/lib/api';
import type { BookingDetails, Venue } from '@/types';

interface VenueChangeFieldProps {
  booking: BookingDetails;
  onUpdate: (next: BookingDetails) => void;
}

export function VenueChangeField({ booking, onUpdate }: VenueChangeFieldProps) {
  const { toast } = useToast();
  // selected holds the venue's NUMERIC id stringified, because Radix Select
  // values are strings. We parse back to a number before submitting.
  const [selected, setSelected] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [venues, setVenues] = useState<Venue[] | null>(null);

  useEffect(() => {
    let active = true;
    getVenues()
      .then((list) => {
        if (active) setVenues(list);
      })
      .catch(() => {
        if (active) setVenues([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const isPending = booking.venueChangeRequest.status === 'pending';

  if (isPending && booking.venueChangeRequest.status === 'pending') {
    return (
      <div className="space-y-3">
        <label className="text-sm font-semibold text-navy">New Venue</label>
        <PendingChangeBanner message="We're currently working on changing your airfield." />
        <div className="rounded-lg bg-soft px-4 py-3 text-sm text-charcoal-500">
          Requested:{' '}
          <span className="font-semibold text-navy">
            {booking.venueChangeRequest.requested.venueName}
          </span>
        </div>
      </div>
    );
  }

  if (venues === null) {
    return (
      <div className="space-y-3">
        <label className="text-sm font-semibold text-navy">New Venue</label>
        <Skeleton className="h-11" />
      </div>
    );
  }

  // Exclude the venue the user is already booked into. We compare slugs
  // because that is what `booking.venueId` carries.
  const options = venues
    .filter((v) => v.slug !== booking.venueId)
    .map((v) => ({
      value: String(v.id),
      label: v.region ? `${v.name} · ${v.region}` : v.name,
    }));

  const handleSubmit = async () => {
    if (!selected) return;
    const venue = venues.find((v) => String(v.id) === selected);
    if (!venue) return;
    try {
      setSubmitting(true);
      const updated = await requestVenueChange(venue.id, venue.slug, venue.name);
      onUpdate(updated);
      toast({
        tone: 'success',
        title: 'Venue change requested',
        description: 'The Skyline team will be in touch to confirm your new airfield.',
      });
    } catch (err) {
      const apiErr = err as ApiError;
      const alreadyPending = apiErr?.code === 'http_409';
      toast({
        tone: 'error',
        title: alreadyPending ? 'Already pending' : 'Could not submit',
        description: alreadyPending
          ? 'A venue change is already being reviewed by the team.'
          : (apiErr?.message ?? 'Please try again.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <SelectField
        label="New Venue"
        placeholder="Choose a different airfield"
        options={options}
        value={selected}
        onValueChange={setSelected}
        hint="Select an airfield to request a change. The Skyline team will confirm by email."
      />
      <Button
        variant="secondary"
        size="sm"
        disabled={!selected}
        loading={submitting}
        onClick={handleSubmit}
      >
        Request venue change
      </Button>
    </div>
  );
}
