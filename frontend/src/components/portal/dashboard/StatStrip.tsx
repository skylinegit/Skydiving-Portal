'use client';

import { CalendarDays, PoundSterling, Target, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/portal/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { daysUntil, formatCurrency } from '@/lib/format';
import type { BookingDetails } from '@/types';

interface StatStripProps {
  booking: BookingDetails | null;
  loading: boolean;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function StatStrip({ booking, loading }: StatStripProps) {
  if (loading || !booking) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </section>
    );
  }

  const days = booking.date1 ? Math.max(0, daysUntil(booking.date1)) : null;

  return (
    <motion.section
      aria-label="Booking overview"
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <motion.div variants={item}>
        <StatCard
          label="Days to jump"
          value={days ?? 'TBC'}
          hint={days != null ? 'Until your first booked date' : 'Awaiting confirmation'}
          icon={CalendarDays}
          tone="sky"
        />
      </motion.div>
      <motion.div variants={item}>
        <StatCard
          label="Jump cost"
          value={formatCurrency(booking.jumpCost)}
          hint={booking.hasPaid ? 'Paid in full' : 'Pay on the day or before'}
          icon={PoundSterling}
          tone="sunburst"
        />
      </motion.div>
      <motion.div variants={item}>
        {booking.isCharityJump ? (
          <StatCard
            label="Fundraising"
            value={formatCurrency(booking.amountRaised)}
            hint={`Target ${formatCurrency(booking.fundraisingMinimum ?? 0)}`}
            icon={Target}
            tone="success"
          />
        ) : (
          <StatCard
            label="Funding"
            value="Self-funded"
            hint="No charity minimum applies"
            icon={Heart}
            tone="navy"
          />
        )}
      </motion.div>
      <motion.div variants={item}>
        <StatCard
          label="Booking"
          value={booking.status[0]!.toUpperCase() + booking.status.slice(1)}
          hint={`Ref ${booking.bookingRef}`}
          icon={Heart}
          tone="navy"
        />
      </motion.div>
    </motion.section>
  );
}
