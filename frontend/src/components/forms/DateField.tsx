'use client';

import { useId, type ReactNode } from 'react';
import type { FieldError as RhfFieldError, UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { FieldError } from './FieldError';
import { cn } from '@/lib/cn';

interface DateFieldProps {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  register?: UseFormRegisterReturn;
  error?: RhfFieldError;
  disabled?: boolean;
  min?: string;
  max?: string;
  containerClassName?: string;
  id?: string;
  defaultValue?: string;
}

export function DateField({
  label,
  hint,
  required,
  register,
  error,
  disabled,
  min,
  max,
  containerClassName,
  id,
  defaultValue,
}: DateFieldProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  return (
    <div className={cn('w-full', containerClassName)}>
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      <Input
        id={inputId}
        type="date"
        invalid={Boolean(error)}
        min={min}
        max={max}
        disabled={disabled}
        defaultValue={defaultValue}
        {...register}
      />
      {hint && !error && <p className="mt-1.5 text-sm text-charcoal-400">{hint}</p>}
      <FieldError error={error} />
    </div>
  );
}
