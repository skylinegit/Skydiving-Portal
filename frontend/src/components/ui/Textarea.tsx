import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'block w-full rounded-lg border bg-cloud px-4 py-3 text-base text-charcoal',
        'placeholder:text-charcoal-300',
        'transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2',
        invalid ? 'border-danger' : 'border-charcoal-100 focus:border-sky',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  ),
);

Textarea.displayName = 'Textarea';
