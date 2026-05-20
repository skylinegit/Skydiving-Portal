'use client';

import { Check, X, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { cn } from '@/lib/cn';
import type { BookingDetails, SessionUser } from '@/types';

interface ReadinessRingProps {
  user: SessionUser;
  booking: BookingDetails;
}

interface ReadinessItem {
  label: string;
  done: boolean;
}

function buildItems(user: SessionUser, booking: BookingDetails): ReadinessItem[] {
  const p = user.profile;
  return [
    { label: 'Phone number added', done: Boolean(p.phone) },
    { label: 'Date of birth added', done: Boolean(p.dob) },
    { label: 'Height and weight recorded', done: p.heightCm > 0 && p.weightKg > 0 },
    { label: 'Terms accepted', done: p.termsAccepted },
    {
      label: booking.isCharityJump ? 'Charity selected' : 'Jump cost cleared',
      done: booking.isCharityJump ? Boolean(booking.charity) : booking.hasPaid,
    },
  ];
}

export function ReadinessRing({ user, booking }: ReadinessRingProps) {
  const items = buildItems(user, booking);
  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);
  const tone: 'sky' | 'success' | 'sunburst' = pct === 100 ? 'success' : pct >= 50 ? 'sky' : 'sunburst';

  return (
    <Card className="relative flex h-full flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -bottom-16 size-48 rounded-full bg-sunburst/10 blur-3xl"
      />
      <header className="relative mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky">Readiness</p>
        <h2 className="mt-1 text-xl font-bold text-navy sm:text-2xl">
          {pct === 100 ? "You're ready" : 'Almost there'}
        </h2>
      </header>

      <div className="relative flex flex-col items-center gap-4 py-2">
        <CircularProgress value={pct} size={156} strokeWidth={12} tone={tone} label="Profile readiness">
          <span className="font-heading text-4xl font-extrabold text-navy">
            <AnimatedNumber value={pct} />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-300">
            Complete
          </span>
        </CircularProgress>

        <ul className="mt-2 w-full space-y-2">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5 text-sm">
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full',
                  item.done ? 'bg-success/15 text-success' : 'bg-charcoal-50 text-charcoal-300',
                )}
              >
                {item.done ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <X className="size-3.5" aria-hidden />
                )}
              </span>
              <span className={cn(item.done ? 'text-charcoal' : 'text-charcoal-400')}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
