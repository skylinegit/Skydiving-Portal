'use client';

import { useId, type ReactNode } from 'react';
import type { FieldError as RhfFieldError } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { FieldError } from './FieldError';
import { cn } from '@/lib/cn';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  required?: boolean;
  error?: RhfFieldError;
  disabled?: boolean;
  containerClassName?: string;
  id?: string;
}

export function SelectField({
  label,
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  hint,
  required,
  error,
  disabled,
  containerClassName,
  id,
}: SelectFieldProps) {
  const reactId = useId();
  const selectId = id ?? reactId;
  return (
    <div className={cn('w-full', containerClassName)}>
      <Label htmlFor={selectId} required={required}>
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={selectId} invalid={Boolean(error)} aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint && !error && <p className="mt-1.5 text-sm text-charcoal-400">{hint}</p>}
      <FieldError error={error} />
    </div>
  );
}
