'use client';

import { useEffect, useState } from 'react';
import {
  Heart,
  PoundSterling,
  Target,
  AlertTriangle,
  CalendarClock,
  Mail,
  Phone,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/portal/StatCard';
import { PageHeader } from '@/components/portal/PageHeader';
import { getBooking } from '@/lib/api';
import { formatCurrency } from '@/lib/format';
import type { BookingDetails } from '@/types';

export default function SponsorshipPage() {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getBooking().then((bk) => {
      if (!active) return;
      setBooking(bk);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  if (loading || !booking) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Fundraising" title="Sponsorship" />
        <Skeleton className="h-40" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!booking.isCharityJump) {
    return <SelfFundedView booking={booking} />;
  }

  return <CharityView booking={booking} />;
}

function SelfFundedView({ booking }: { booking: BookingDetails }) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sponsorship"
        title={`Jump Cost - ${formatCurrency(booking.jumpCost)}`}
        description={
          booking.hasPaid
            ? 'You have paid in full. There is nothing further owing for your jump.'
            : 'You are currently in our system as having not paid for your jump. You can do this by contacting Skyline or paying the airfield directly on the day by cash or card.'
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Jump cost"
          value={formatCurrency(booking.jumpCost)}
          hint={booking.hasPaid ? 'Paid in full' : 'Outstanding'}
          icon={PoundSterling}
          tone="sunburst"
        />
        <StatCard
          label="Status"
          value={booking.hasPaid ? 'Paid' : 'Not paid'}
          hint={booking.hasPaid ? 'Thank you' : 'Pay on the day or before'}
          icon={Heart}
          tone={booking.hasPaid ? 'success' : 'navy'}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to pay</CardTitle>
          <CardDescription>
            You can settle your jump cost by contacting Skyline or paying the airfield directly on
            the day.
          </CardDescription>
        </CardHeader>
        <ul className="space-y-3 text-base leading-relaxed text-charcoal">
          <li className="flex items-start gap-3">
            <Phone className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden />
            <span>
              Call the Skyline office on{' '}
              <a href="tel:02074245522" className="font-semibold text-navy hover:text-sky">
                0207 424 5522
              </a>
              .
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Mail className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden />
            <span>
              Email{' '}
              <a
                href="mailto:myskydive@skylineevents.co.uk"
                className="font-semibold text-navy hover:text-sky"
              >
                myskydive@skylineevents.co.uk
              </a>{' '}
              and the team will send a payment link.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <PoundSterling className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden />
            <span>Or pay at the airfield by cash or card on the day of your jump.</span>
          </li>
        </ul>
      </Card>

      {/* Cancellation policy */}
      <Card className="border-sunburst/30 bg-sunburst-50">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-sunburst" aria-hidden />
          <div>
            <h3 className="text-base font-bold text-navy">Cancellation policy</h3>
            <p className="mt-2 text-base leading-relaxed text-charcoal">
              Please note a <strong className="font-semibold">£50 cancellation fee</strong> will be
              charged for any changes made by you within four weeks of your jump date. This
              raises to <strong className="font-semibold">£100</strong> within 1 week (7 days) of
              your jump date.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function CharityView({ booking }: { booking: BookingDetails }) {
  const target = booking.fundraisingMinimum ?? 0;
  const raised = booking.amountRaised;
  const remaining = Math.max(0, target - raised);
  const pct = target > 0 ? Math.min(100, (raised / target) * 100) : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Fundraising"
        title="Charity sponsorship"
        description="Track your fundraising progress, jump cost and the cancellation policy."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Jump cost"
          value={formatCurrency(booking.jumpCost)}
          hint="Covered by your fundraising"
          icon={PoundSterling}
          tone="sunburst"
        />
        <StatCard
          label="Fundraising target"
          value={formatCurrency(target)}
          hint="Minimum sponsorship"
          icon={Target}
          tone="sky"
        />
        <StatCard
          label="Raised so far"
          value={formatCurrency(raised)}
          hint={remaining === 0 ? 'Target reached' : `${formatCurrency(remaining)} to go`}
          icon={Heart}
          tone={remaining === 0 ? 'success' : 'navy'}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Your fundraising progress</CardTitle>
          <CardDescription>
            You need to reach your minimum target at least seven days before your jump date.
          </CardDescription>
        </CardHeader>
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-bold text-navy">{formatCurrency(raised)}</p>
              <p className="text-sm text-charcoal-400">of {formatCurrency(target)}</p>
            </div>
            <Badge tone={remaining === 0 ? 'success' : 'sunburst'}>
              {remaining === 0 ? 'Target reached' : `${Math.round(pct)}%`}
            </Badge>
          </div>
          <ProgressBar
            value={raised}
            max={target}
            tone={remaining === 0 ? 'success' : 'sky'}
            label="Fundraising progress"
          />
          <p className="text-xs text-charcoal-400">
            Donations made through your JustGiving page are reconciled with the Skyline team ahead
            of your jump.
          </p>
        </div>
      </Card>

      <Card className="border-sunburst/30 bg-sunburst-50">
        <div className="flex items-start gap-3">
          <CalendarClock className="mt-0.5 size-5 shrink-0 text-sunburst" aria-hidden />
          <div>
            <h3 className="text-base font-bold text-navy">Cancellation policy</h3>
            <p className="mt-2 text-base leading-relaxed text-charcoal">
              A <strong className="font-semibold">£50 cancellation fee</strong> applies for any
              changes made within four weeks of your jump date. This raises to{' '}
              <strong className="font-semibold">£100</strong> within 1 week (7 days) of your jump
              date.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
