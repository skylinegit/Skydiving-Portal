import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: 'sky' | 'sunburst' | 'success' | 'navy';
  className?: string;
}

const toneStyles: Record<NonNullable<StatCardProps['tone']>, { icon: string; bubble: string }> = {
  sky: { icon: 'text-sky', bubble: 'bg-sky/10' },
  sunburst: { icon: 'text-sunburst', bubble: 'bg-sunburst/10' },
  success: { icon: 'text-success', bubble: 'bg-success/10' },
  navy: { icon: 'text-navy', bubble: 'bg-navy/10' },
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'sky',
  className,
}: StatCardProps) {
  const styles = toneStyles[tone];
  return (
    <div
      className={cn(
        'group bg-cloud rounded-card shadow-card border border-navy/[0.04] p-5 transition-all hover:-translate-y-0.5 hover:shadow-elevated',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-300">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-navy">{value}</p>
          {hint && <p className="mt-1 text-sm text-charcoal-400">{hint}</p>}
        </div>
        <div className={cn('rounded-pill p-3 transition-transform group-hover:scale-105', styles.bubble)}>
          <Icon className={cn('size-5', styles.icon)} aria-hidden />
        </div>
      </div>
    </div>
  );
}
