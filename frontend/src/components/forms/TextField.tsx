'use client';

import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import type { FieldError as RhfFieldError, UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { FieldError } from './FieldError';
import { cn } from '@/lib/cn';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  register?: UseFormRegisterReturn;
  error?: RhfFieldError;
  containerClassName?: string;
  leftIcon?: ReactNode;
  rightAdornment?: ReactNode;
}

export function TextField({
  label,
  hint,
  required,
  register,
  error,
  containerClassName,
  leftIcon,
  rightAdornment,
  className,
  id,
  ...rest
}: TextFieldProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cn('w-full', containerClassName)}>
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      <div className="relative">
        {leftIcon && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 items-center text-charcoal-300"
          >
            {leftIcon}
          </span>
        )}
        <Input
          id={inputId}
          invalid={Boolean(error)}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          className={cn(leftIcon && 'pl-11', rightAdornment && 'pr-12', className)}
          {...register}
          {...rest}
        />
        {rightAdornment && (
          <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
            {rightAdornment}
          </span>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-charcoal-400">
          {hint}
        </p>
      )}
      <FieldError error={error} />
    </div>
  );
}
