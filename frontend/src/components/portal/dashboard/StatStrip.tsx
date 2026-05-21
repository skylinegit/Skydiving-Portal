'use client';

import { Ticket, Wallet, Clock, CheckCircle2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatCard } from '@/components/portal/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/format';
import type { BookingDetails } from '@/types';

interface StatStripProps {
  booking: BookingDetails | null;
  loading: boolean;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export function StatStrip({ booking, loading }: StatStripProps) {
  if (loading || !booking) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </section>
    );
  }

  const statusLabel = booking.status[0]!.toUpperCase() + booking.status.slice(1);
  const isConfirmed = booking.status === 'confirmed';

  return (
    <motion.section
      aria-label="Booking overview"
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {/* Jump cost */}
      <motion.div variants={item}>
        <StatCard
          label="Jump cost"
          value={formatCurrency(booking.jumpCost)}
          icon={Wallet}
          tone="sunburst"
          badge={
            booking.hasPaid ? (
              <Badge tone="success" icon={<CheckCircle2 className="size-3.5" aria-hidden />}>
                Paid in full
              </Badge>
            ) : (
              <Badge tone="sunburst" icon={<Clock className="size-3.5" aria-hidden />}>
                Due on the day
              </Badge>
            )
          }
        />
      </motion.div>

      {/* Funding (charity vs self-funded) */}
      <motion.div variants={item}>
        <StatCard
          label="Funding"
          value={booking.isCharityJump ? 'Charity' : 'Self-funded'}
          icon={Heart}
          tone="navy"
          badge={
            <Badge tone="neutral">
              {booking.isCharityJump ? booking.charity : 'No charity minimum'}
            </Badge>
          }
        />
      </motion.div>

      {/* Booking status — animated to draw attention */}
      <motion.div
        variants={item}
        // Subtle scale-bounce on the whole card to make it feel "alive"
        whileHover={{ y: -3 }}
      >
        <StatCard
          label="Booking"
          value={
            <span className="inline-flex items-center gap-2.5">
              {isConfirmed && (
                <motion.span
                  aria-hidden
                  className="block size-2.5 rounded-full bg-success"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
                />
              )}
              <span>{statusLabel}</span>
            </span>
          }
          icon={Ticket}
          tone="success"
          pulseIcon={isConfirmed}
          badge={
            <Badge
              tone={isConfirmed ? 'success' : 'neutral'}
              icon={isConfirmed ? <CheckCircle2 className="size-3.5" aria-hidden /> : undefined}
            >
              Ref {booking.bookingRef}
            </Badge>
          }
        />
      </motion.div>
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// Local Badge component — kept inline because it's only used by StatStrip.
// Uses the design.md palette (sunburst, success, charcoal) — no new colours.
// ---------------------------------------------------------------------------

interface BadgeProps {
  tone: 'sunburst' | 'success' | 'neutral';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function Badge({ tone, icon, children }: BadgeProps) {
  const toneClass =
    tone === 'sunburst'
      ? 'bg-sunburst-50 text-sunburst-600 border border-sunburst-200'
      : tone === 'success'
        ? 'bg-success/10 text-success border border-success/20'
        : 'bg-charcoal-50 text-charcoal-400 border border-charcoal-100';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold ${toneClass}`}
    >
      {icon}
      <span>{children}</span>
    </span>
  );
}
