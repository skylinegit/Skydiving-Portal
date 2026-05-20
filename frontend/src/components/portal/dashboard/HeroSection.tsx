'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  MapPin,
  Hash,
  Download,
  User,
  ArrowRight,
  Plane,
} from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatLongDate } from '@/lib/format';
import { cn } from '@/lib/cn';

interface HeroSectionProps {
  displayName: string;
  jumpDate?: string;
  venueName?: string;
  bookingRef?: string;
  loading?: boolean;
}

function greetingFor(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function daysHoursUntil(iso: string) {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return { days, hours, minutes, total: diff };
}

export function HeroSection({
  displayName,
  jumpDate,
  venueName,
  bookingRef,
  loading,
}: HeroSectionProps) {
  // greeting depends on the viewer's local hour: compute it after mount
  // to avoid a hydration mismatch between server (UTC) and client (local).
  const [greeting, setGreeting] = useState<string | null>(null);
  useEffect(() => {
    setGreeting(greetingFor());
  }, []);

  const t = jumpDate ? daysHoursUntil(jumpDate) : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[1.5rem] bg-navy-gradient text-cloud shadow-card"
    >
      {/* Decorative orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-sky/25 blur-3xl animate-cloud-drift"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 bottom-0 size-56 rounded-full bg-sky-300/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/3 top-1/2 h-px w-64 -rotate-12 bg-gradient-to-r from-sky/0 via-sky/40 to-sky/0"
      />

      <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        {/* Left: greeting + booking info */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
              Your jump
            </p>
            <h1 className="mt-2 text-3xl font-bold text-cloud sm:text-4xl lg:text-5xl text-balance">
              {greeting ? `${greeting}, ` : 'Hello, '}
              <span className="bg-gradient-to-r from-sky-200 to-sky-400 bg-clip-text text-transparent">
                {displayName}
              </span>
            </h1>
            <p className="mt-3 max-w-lg text-base text-cloud/80 sm:text-lg">
              {loading
                ? 'Loading your booking details…'
                : jumpDate
                  ? `Your tandem skydive${venueName ? ` at ${venueName}` : ''} is on the way. Here is everything you need.`
                  : 'Your jump date will appear here once it is confirmed.'}
            </p>
          </div>

          {!loading && jumpDate && (
            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <InfoChip icon={<CalendarDays className="size-4" aria-hidden />}>
                {formatLongDate(jumpDate)}
              </InfoChip>
              {venueName && (
                <InfoChip icon={<MapPin className="size-4" aria-hidden />}>{venueName}</InfoChip>
              )}
              {bookingRef && (
                <InfoChip icon={<Hash className="size-3.5" aria-hidden />}>
                  <span className="font-mono">{bookingRef}</span>
                </InfoChip>
              )}
            </div>
          )}

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <HeroAction href="/portal/venue" icon={<MapPin className="size-4" aria-hidden />}>
              Venue
            </HeroAction>
            <HeroAction href="/portal/forms" icon={<Download className="size-4" aria-hidden />}>
              Forms
            </HeroAction>
            <HeroAction href="/portal/profile" icon={<User className="size-4" aria-hidden />}>
              Profile
            </HeroAction>
          </div>
        </div>

        {/* Right: countdown */}
        <div className="relative flex items-center justify-center lg:justify-end">
          {loading || !t ? (
            <Skeleton className="h-56 w-64 bg-cloud/10" />
          ) : (
            <div className="relative">
              {/* Outer ring pulse */}
              <span
                aria-hidden
                className="absolute -inset-3 rounded-[2rem] ring-2 ring-sky/30 animate-pulse-ring"
              />
              <div className="relative flex flex-col items-center gap-1 rounded-[2rem] border border-cloud/15 bg-cloud/[0.06] px-10 py-8 backdrop-blur-md">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                  <Plane className="size-3.5" aria-hidden />
                  Countdown
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-heading text-7xl font-extrabold leading-none text-cloud sm:text-8xl">
                    <AnimatedNumber value={t.days} />
                  </span>
                  <span className="text-xl font-semibold uppercase tracking-wider text-cloud/80">
                    {t.days === 1 ? 'day' : 'days'}
                  </span>
                </div>
                {t.days < 7 && (
                  <p className="mt-1 text-sm text-cloud/70">
                    {t.hours}h {t.minutes}m until exit
                  </p>
                )}
                <p className="mt-2 text-xs text-cloud/60">10,000ft awaits</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

function InfoChip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-pill border border-cloud/15 bg-cloud/[0.06] px-3 py-1.5 text-cloud/90 backdrop-blur-sm">
      <span className="text-sky-200">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function HeroAction({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex items-center gap-2 rounded-pill border border-cloud/20 bg-cloud/[0.08] px-4 py-2 text-sm font-semibold text-cloud',
        'transition-all hover:-translate-y-0.5 hover:border-cloud/40 hover:bg-cloud/15',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-navy',
      )}
    >
      {icon}
      <span>{children}</span>
      <ArrowRight
        className="size-3.5 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
