import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  // ReactNode so callers can render an inline indicator alongside the value
  // (e.g. a pulsing dot before "Confirmed"). Strings and numbers still work.
  value: ReactNode;
  hint?: string;
  badge?: ReactNode;
  icon: LucideIcon;
  tone?: 'sky' | 'sunburst' | 'success' | 'navy';
  className?: string;
  /** Adds a subtle continuous pulse around the icon bubble. */
  pulseIcon?: boolean;
}

const toneStyles: Record<NonNullable<StatCardProps['tone']>, { icon: string; bubble: string }> = {
  sky: { icon: 'text-sky', bubble: 'bg-sky/10' },
  sunburst: { icon: 'text-sunburst-600', bubble: 'bg-sunburst-50' },
  success: { icon: 'text-success', bubble: 'bg-success/10' },
  navy: { icon: 'text-navy', bubble: 'bg-navy/10' },
};

export function StatCard({
  label,
  value,
  hint,
  badge,
  icon: Icon,
  tone = 'sky',
  className,
  pulseIcon = false,
}: StatCardProps) {
  const styles = toneStyles[tone];
  return (
    <div
      className={cn(
        'group flex h-full flex-col rounded-card border border-navy/[0.04] bg-cloud p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-300">
          {label}
        </p>
        <div
          className={cn(
            'relative rounded-pill p-3 transition-transform group-hover:scale-105',
            styles.bubble,
          )}
        >
          {pulseIcon && (
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute inset-0 rounded-pill ring-2 ring-success/40 animate-pulse-ring',
              )}
            />
          )}
          <Icon className={cn('relative size-5', styles.icon)} aria-hidden />
        </div>
      </div>

      <p className="mt-3 text-3xl font-bold text-navy">{value}</p>

      {/* Either a styled badge or a plain hint line, never both. */}
      {badge ? (
        <div className="mt-3">{badge}</div>
      ) : hint ? (
        <p className="mt-1 text-sm text-charcoal-400">{hint}</p>
      ) : null}
    </div>
  );
}
