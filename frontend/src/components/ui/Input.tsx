import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const inputBase =
  'block w-full rounded-lg border bg-cloud px-4 py-3 text-base text-charcoal ' +
  'placeholder:text-charcoal-300 ' +
  'transition-colors ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-cloud ' +
  'disabled:cursor-not-allowed disabled:bg-charcoal-50 disabled:text-charcoal-300';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        inputBase,
        invalid ? 'border-danger focus:border-danger' : 'border-charcoal-100 focus:border-sky',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  ),
);

Input.displayName = 'Input';
