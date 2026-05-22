'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PendingChangeBanner } from './PendingChangeBanner';
import { useToast } from '@/components/ui/Toast';
import { requestDatesChange, type ApiError } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { BookingDetails } from '@/types';

interface DatesChangeFieldProps {
  booking: BookingDetails;
  onUpdate: (next: BookingDetails) => void;
}

export function DatesChangeField({ booking, onUpdate }: DatesChangeFieldProps) {
  const { toast } = useToast();
  // today's date is viewer-local, so compute it after mount to avoid an SSR
  // mismatch on time-zone boundaries.
  const [today, setToday] = useState<string | undefined>(undefined);
  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (booking.datesChangeRequest.status === 'pending') {
    const { requested } = booking.datesChangeRequest;
    return (
      <div className="space-y-3">
        <Label>Requested jump date(s)</Label>
        <PendingChangeBanner message="We're currently working on changing your jump date." />
        <ul className="space-y-1 rounded-lg bg-soft px-4 py-3 text-sm text-navy">
          <li>{formatDate(requested.date1)}</li>
          {requested.date2 && <li>{formatDate(requested.date2)}</li>}
        </ul>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!date1) return;
    try {
      setSubmitting(true);
      const updated = await requestDatesChange(date1, date2 || null);
      onUpdate(updated);
      setDate1('');
      setDate2('');
      toast({
        tone: 'success',
        title: 'Date change requested',
        description: 'The Skyline team will confirm your new dates by email.',
      });
    } catch (err) {
      const apiErr = err as ApiError;
      const alreadyPending = apiErr?.code === 'http_409';
      toast({
        tone: 'error',
        title: alreadyPending ? 'Already pending' : 'Could not submit',
        description: alreadyPending
          ? 'A date change is already being reviewed by the team.'
          : (apiErr?.message ?? 'Please try again.'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="dates-change-1" required>
            Preferred date
          </Label>
          <Input
            id="dates-change-1"
            type="date"
            min={today}
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            placeholder={formatDate(booking.date1)}
          />
          <p className="mt-1.5 text-xs text-charcoal-400">
            Currently booked: {formatDate(booking.date1)}
          </p>
        </div>
        <div>
          <Label htmlFor="dates-change-2">Backup date (optional)</Label>
          <Input
            id="dates-change-2"
            type="date"
            min={today}
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            placeholder={booking.date2 ? formatDate(booking.date2) : 'Optional second choice'}
          />
          {booking.date2 && (
            <p className="mt-1.5 text-xs text-charcoal-400">
              Currently booked: {formatDate(booking.date2)}
            </p>
          )}
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        disabled={!date1}
        loading={submitting}
        onClick={handleSubmit}
      >
        Request date change
      </Button>
    </div>
  );
}
