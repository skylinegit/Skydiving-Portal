import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <section className={cn('space-y-5', className)}>
      {(title || description) && (
        <header>
          {title && <h2 className="text-xl font-bold text-navy">{title}</h2>}
          {description && <p className="mt-1 text-sm text-charcoal-400">{description}</p>}
        </header>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  );
}
