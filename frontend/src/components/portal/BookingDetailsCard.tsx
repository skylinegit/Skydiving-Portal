import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import type { BookingDetails } from '@/types';
import { formatDate } from '@/lib/format';

interface BookingDetailsCardProps {
  booking: BookingDetails;
}

const statusTone: Record<BookingDetails['status'], 'sky' | 'success' | 'sunburst' | 'danger'> = {
  confirmed: 'success',
  pending: 'sunburst',
  completed: 'sky',
  cancelled: 'danger',
};

const statusLabel: Record<BookingDetails['status'], string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-navy/[0.06] py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <dt className="text-sm font-semibold uppercase tracking-wider text-charcoal-400 sm:w-1/3">
        {label}
      </dt>
      <dd className="text-sm text-charcoal sm:flex-1 sm:text-right">{children}</dd>
    </div>
  );
}

export function BookingDetailsCard({ booking }: BookingDetailsCardProps) {
  return (
    <dl>
      <Row label="Booking date">{formatDate(booking.bookingDate)}</Row>
      <Row label="Reference">
        <span className="font-mono text-charcoal">#{booking.bookingRef}</span>
      </Row>
      <Row label="Charity">
        <div className="flex flex-col gap-1 sm:items-end">
          <span className="font-semibold text-navy">{booking.charity}</span>
          {booking.isCharityJump && (
            <span className="text-xs text-danger">
              If you set up a fundraising page, please ensure it donates to this charity.
            </span>
          )}
        </div>
      </Row>
      <Row label="Status">
        <Badge tone={statusTone[booking.status]}>{statusLabel[booking.status]}</Badge>
      </Row>
      <Row label="Venue">
        <div className="flex flex-col gap-1 sm:items-end">
          <span className="font-semibold text-navy">{booking.venueName}</span>
          <span className="text-xs text-charcoal-400">
            Please ensure you can return to this airfield if your jump is rescheduled due to weather.
          </span>
        </div>
      </Row>
    </dl>
  );
}
