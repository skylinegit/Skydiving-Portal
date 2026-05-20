import { Clock } from 'lucide-react';
import { cn } from '@/lib/cn';

interface PendingChangeBannerProps {
  message: string;
  className?: string;
}

export function PendingChangeBanner({ message, className }: PendingChangeBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-sunburst/30 bg-sunburst-50 p-3 text-sm text-charcoal',
        className,
      )}
    >
      <Clock className="mt-0.5 size-4 shrink-0 text-sunburst" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
