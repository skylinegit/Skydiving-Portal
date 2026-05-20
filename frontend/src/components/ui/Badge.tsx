import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'sky' | 'navy' | 'sunburst' | 'success' | 'danger' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  sky: 'bg-sky-50 text-sky-700 ring-sky-200',
  navy: 'bg-navy-50 text-navy-700 ring-navy-200',
  sunburst: 'bg-sunburst-50 text-sunburst-600 ring-sunburst-200',
  success: 'bg-green-50 text-green-700 ring-green-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  neutral: 'bg-charcoal-50 text-charcoal-500 ring-charcoal-100',
};

export function Badge({ tone = 'sky', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
