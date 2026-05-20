'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ChecklistItem } from '@/content/checklist';
import { cn } from '@/lib/cn';

const CARD_DESTINATIONS: Record<string, { href: string; cta: string }> = {
  'medical-form': { href: '/portal/forms', cta: 'Go to My Forms' },
  'outstanding-costs': { href: '/portal/sponsorship', cta: 'View costs' },
  'reaching-target': { href: '/portal/sponsorship', cta: 'View target' },
  'plan-your-trip': { href: '/portal/venue', cta: 'Venue information' },
};

interface ChecklistCardProps {
  item: ChecklistItem;
  index: number;
}

export function ChecklistCard({ item, index }: ChecklistCardProps) {
  const Icon = item.icon;
  const link = CARD_DESTINATIONS[item.id];
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 * index, ease: 'easeOut' }}
      className={cn(
        'group relative flex flex-col gap-3 overflow-hidden rounded-card border border-navy/[0.06] bg-cloud p-6 shadow-card',
        'transition-all hover:-translate-y-0.5 hover:shadow-elevated',
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 size-32 -translate-y-12 translate-x-12 rounded-full bg-sky/5 transition-transform duration-500 group-hover:scale-125"
      />
      <div className="relative flex items-start gap-4">
        <div className="rounded-pill bg-sky/10 p-3 transition-transform group-hover:scale-105">
          <Icon className="size-5 text-sky" aria-hidden />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-navy">{item.title}</h3>
        </div>
      </div>
      <p className="relative text-sm leading-relaxed text-charcoal">{item.description}</p>
      {link && (
        <Link
          href={link.href}
          className="relative mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sky transition-colors hover:text-sky-700"
        >
          {link.cta}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </motion.article>
  );
}
