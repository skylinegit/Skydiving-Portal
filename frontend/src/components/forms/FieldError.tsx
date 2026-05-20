import type { FieldError as RhfFieldError } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface FieldErrorProps {
  error?: RhfFieldError | { message?: string };
  className?: string;
}

export function FieldError({ error, className }: FieldErrorProps) {
  if (!error?.message) return null;
  return (
    <p
      role="alert"
      className={cn('mt-1.5 flex items-center gap-1.5 text-sm text-danger', className)}
    >
      <AlertCircle className="size-4 shrink-0" aria-hidden />
      <span>{error.message}</span>
    </p>
  );
}
