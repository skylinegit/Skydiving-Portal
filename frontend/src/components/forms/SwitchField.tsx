'use client';

import { useId, type ReactNode } from 'react';
import type { FieldError as RhfFieldError } from 'react-hook-form';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { FieldError } from './FieldError';
import { cn } from '@/lib/cn';

interface SwitchFieldProps {
  label: string;
  description?: ReactNode;
  required?: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: RhfFieldError;
  containerClassName?: string;
}

export function SwitchField({
  label,
  description,
  required,
  checked,
  onCheckedChange,
  error,
  containerClassName,
}: SwitchFieldProps) {
  const id = useId();
  return (
    <div className={cn('w-full', containerClassName)}>
      <div className="flex items-start gap-3">
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
        <div className="flex-1">
          <Label htmlFor={id} required={required} className="mb-0 cursor-pointer">
            {label}
          </Label>
          {description && <p className="mt-1 text-sm text-charcoal-400">{description}</p>}
        </div>
      </div>
      <FieldError error={error} />
    </div>
  );
}
