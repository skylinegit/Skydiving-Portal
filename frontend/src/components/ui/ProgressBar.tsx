import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  tone?: 'sky' | 'success' | 'sunburst';
  label?: string;
}

const toneClasses: Record<NonNullable<ProgressBarProps['tone']>, string> = {
  sky: 'bg-sky',
  success: 'bg-success',
  sunburst: 'bg-sunburst',
};

export function ProgressBar({
  value,
  max = 100,
  className,
  tone = 'sky',
  label,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn('w-full', className)}>
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="relative h-2 w-full overflow-hidden rounded-pill bg-charcoal-50"
      >
        <div
          className={cn(
            'h-full rounded-pill transition-[width] duration-500 ease-out',
            toneClasses[tone],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
