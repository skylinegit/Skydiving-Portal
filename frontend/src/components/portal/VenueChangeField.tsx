'use client';

import { useState } from 'react';
import { SelectField } from '@/components/forms/SelectField';
import { PendingChangeBanner } from './PendingChangeBanner';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { requestVenueChange } from '@/lib/api';
import { MOCK_VENUES } from '@/lib/mock-data';
import type { BookingDetails } from '@/types';

interface VenueChangeFieldProps {
  booking: BookingDetails;
  onUpdate: (next: BookingDetails) => void;
}

export function VenueChangeField({ booking, onUpdate }: VenueChangeFieldProps) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const isPending = booking.venueChangeRequest.status === 'pending';

  if (isPending && booking.venueChangeRequest.status === 'pending') {
    return (
      <div className="space-y-3">
        <label className="text-sm font-semibold text-navy">New Venue</label>
        <PendingChangeBanner message="We're currently working on changing your airfield." />
        <div className="rounded-lg bg-soft px-4 py-3 text-sm text-charcoal-500">
          Requested: <span className="font-semibold text-navy">{booking.venueChangeRequest.requested.venueName}</span>
        </div>
      </div>
    );
  }

  const options = MOCK_VENUES.filter((v) => v.id !== booking.venueId).map((v) => ({
    value: v.id,
    label: `${v.name} · ${v.region}`,
  }));

  const handleSubmit = async () => {
    if (!selected) return;
    const venue = MOCK_VENUES.find((v) => v.id === selected);
    if (!venue) return;
    try {
      setSubmitting(true);
      const updated = await requestVenueChange(venue.id, venue.name);
      onUpdate(updated);
      toast({
        tone: 'success',
        title: 'Venue change requested',
        description: 'The Skyline team will be in touch to confirm your new airfield.',
      });
    } catch {
      toast({ tone: 'error', title: 'Could not submit', description: 'Please try again.' });
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
