import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  tone?: 'sky' | 'success' | 'sunburst';
  className?: string;
  children?: ReactNode;
  label?: string;
}

const toneColors: Record<NonNullable<CircularProgressProps['tone']>, string> = {
  sky: 'text-sky',
  success: 'text-success',
  sunburst: 'text-sunburst',
};

export function CircularProgress({
  value,
  max = 100,
  size = 144,
  strokeWidth = 10,
  tone = 'sky',
  className,
  children,
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const dashOffset = circumference * (1 - pct);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(pct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-navy/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn(toneColors[tone], 'transition-[stroke-dashoffset] duration-1000 ease-out')}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
