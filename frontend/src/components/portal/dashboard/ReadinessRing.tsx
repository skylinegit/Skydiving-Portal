'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { enGB } from 'date-fns/locale';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { BookingDetails, SessionUser } from '@/types';

interface ReadinessRingProps {
  user: SessionUser;
  booking: BookingDetails;
}

interface ReadinessItem {
  id: string;
  label: string;
  done: boolean;
  description?: string;
  href: string;
}

function buildItems(user: SessionUser, booking: BookingDetails): ReadinessItem[] {
  const p = user.profile;

  // The medical declaration deadline is seven days before the jump.
  // Format the date in British style, e.g. "26 May".
  let deadlineLabel: string | null = null;
  if (booking.date1) {
    const jumpDate = new Date(booking.date1);
    const deadline = new Date(jumpDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (!Number.isNaN(deadline.getTime())) {
      deadlineLabel = format(deadline, 'd MMMM', { locale: enGB });
    }
  }

  return [
    {
      id: 'phone',
      label: 'Phone number added',
      done: Boolean(p.phone),
      description: 'Add the number the airfield can reach you on.',
      href: '/portal/profile',
    },
    {
      id: 'dob',
      label: 'Date of birth added',
      done: Boolean(p.dob),
      description: 'Required for the British Skydiving membership.',
      href: '/portal/profile',
    },
    {
      id: 'measurements',
      label: 'Height and weight recorded',
      done: p.heightCm > 0 && p.weightKg > 0,
      description: 'Used to fit your harness on the day.',
      href: '/portal/profile',
    },
    {
      id: 'terms',
      label: 'Terms accepted',
      done: p.termsAccepted,
      description: 'Read and accept the Skyline terms and conditions.',
      href: '/portal/profile',
    },
    {
      // TODO: replace `done: false` with a real users.medical_declared field
      // once the medical workflow lands. For now this stays outstanding so the
      // user can complete it via the Forms page.
      id: 'medical',
      label: 'Medical declaration outstanding',
      done: false,
      description: deadlineLabel
        ? `Required before ${deadlineLabel}. Takes about 3 minutes.`
        : 'Takes about 3 minutes.',
      href: '/portal/forms',
    },
  ];
}

function readinessTitle(done: number, total: number): string {
  const remaining = total - done;
  if (remaining === 0) return "You're ready to jump";
  if (remaining === 1) return 'Almost there, one step to go';
  if (remaining === 2) return 'Two steps to go';
  if (done === 0) return "Let's get you ready";
  return `${remaining} steps to go`;
}

export function ReadinessRing({ user, booking }: ReadinessRingProps) {
  const items = buildItems(user, booking);
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / total) * 100);

  return (
    <Card className="relative h-full overflow-hidden">
      {/* Header: eyebrow + completion fraction */}
      <header className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-300">
          Readiness
        </p>
        <p className="text-sm">
          <span className="font-bold text-navy">
            {done} of {total}
          </span>{' '}
          <span className="text-charcoal-400">complete</span>
        </p>
      </header>

      <h2 className="mt-2 text-xl font-bold text-navy sm:text-2xl">
        {readinessTitle(done, total)}
      </h2>

      {/* Horizontal progress bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-navy/[0.06]">
        <motion.div
          className="h-full rounded-full bg-success"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>

      {/* Items list. Completed → strikethrough green-check row.
          Outstanding → highlighted sunburst notice with a Complete CTA. */}
      <ul className="mt-6 space-y-3">
        {items.map((it) =>
          it.done ? (
            <CompletedRow key={it.id} label={it.label} />
          ) : (
            <OutstandingItem key={it.id} item={it} />
          ),
        )}
      </ul>
    </Card>
  );
}

function CompletedRow({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success text-white">
        <Check className="size-3.5" aria-hidden />
      </span>
      <span className="text-base text-charcoal-300 line-through">{label}</span>
    </li>
  );
}

function OutstandingItem({ item }: { item: ReadinessItem }) {
  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-card border border-sunburst-200 bg-sunburst-50 p-4',
        'sm:flex-col sm:items-center sm:gap-4',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-sunburst-300"
        >
          <Circle className="size-3.5 text-transparent" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-base font-bold text-sunburst-600">{item.label}</p>
          {item.description && (
            <p className="mt-0.5 text-sm text-sunburst-600/85">{item.description}</p>
          )}
        </div>
      </div>
      <Link
        href={item.href}
        className={cn(
          'inline-flex w-full items-center justify-center gap-1.5 rounded-pill bg-sunburst-600 px-4 py-2 text-sm font-semibold text-white shadow-sm',
          'transition-all hover:bg-sunburst-500 hover:shadow-md',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunburst focus-visible:ring-offset-2 focus-visible:ring-offset-cloud',
        )}
      >
        Complete
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </li>
  );
}
