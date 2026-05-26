'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChecklistCard } from '@/components/portal/ChecklistCard';
import { HeroSection } from '@/components/portal/dashboard/HeroSection';
import { AltitudeTimeline } from '@/components/portal/dashboard/AltitudeTimeline';
import { ReadinessRing } from '@/components/portal/dashboard/ReadinessRing';
import { StatStrip } from '@/components/portal/dashboard/StatStrip';
import { HelpBanner } from '@/components/portal/dashboard/HelpBanner';
import { Skeleton } from '@/components/ui/Skeleton';
import { checklistIntro, checklistItems } from '@/content/checklist';
import { getBooking } from '@/lib/api';
import { useCurrentUser } from '@/lib/auth';
import type { BookingDetails } from '@/types';

export default function ChecklistPage() {
  // Shared user from SessionProvider — no extra GET /me fetch on this page.
  const user = useCurrentUser();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [bookingLoading, setBookingLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getBooking()
      .then((bk) => {
        if (active) setBooking(bk);
      })
      .catch(() => {
        // 404 (no booking yet) or network blip — fall through to the loading
        // state. Toast/banner UX can be layered later.
        if (active) setBooking(null);
      })
      .finally(() => {
        if (active) setBookingLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const displayName = user?.account.displayName.split(' ')[0] ?? 'Jumper';
  const isLoading = bookingLoading || user == null;

  return (
    <div className="space-y-8">
      <HeroSection
        displayName={displayName}
        jumpDate={booking?.date1}
        venueName={booking?.venueName}
        bookingRef={booking?.bookingRef}
        loading={isLoading}
      />

      <StatStrip booking={booking} loading={isLoading} />

      {/* Bento row: altitude timeline (wide) + readiness ring (narrow) */}
      <section className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="lg:col-span-2"
        >
          <AltitudeTimeline />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        >
          {isLoading || !user || !booking ? (
            <Skeleton className="h-full min-h-[28rem]" />
          ) : (
            <ReadinessRing user={user} booking={booking} />
          )}
        </motion.div>
      </section>

      {/* Checklist */}
      <section aria-labelledby="checklist-heading" className="space-y-4">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky">Before you jump</p>
          <h2
            id="checklist-heading"
            className="text-2xl font-bold text-navy sm:text-3xl text-balance"
          >
            Your pre-jump checklist
          </h2>
          <p className="max-w-2xl text-sm text-charcoal-400">{checklistIntro}</p>
        </header>

        <div className="grid gap-5 sm:grid-cols-2">
          {checklistItems.map((item, i) => (
            <ChecklistCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>

      <HelpBanner />
    </div>
  );
}
