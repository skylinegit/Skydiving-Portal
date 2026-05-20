'use client';

import { useId } from 'react';
import type { FieldError as RhfFieldError, UseFormRegisterReturn } from 'react-hook-form';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { FieldError } from './FieldError';
import { cn } from '@/lib/cn';

interface HeightFieldProps {
  label?: string;
  required?: boolean;
  registerFeet: UseFormRegisterReturn;
  registerInches: UseFormRegisterReturn;
  errorFeet?: RhfFieldError;
  errorInches?: RhfFieldError;
  containerClassName?: string;
}

export function HeightField({
  label = 'Height',
  required,
  registerFeet,
  registerInches,
  errorFeet,
  errorInches,
  containerClassName,
}: HeightFieldProps) {
  const feetId = useId();
  const inchesId = useId();
  const error = errorFeet ?? errorInches;
  return (
    <div className={cn('w-full', containerClassName)}>
      <Label required={required}>{label}</Label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={feetId} className="text-xs font-medium text-charcoal-400">
            Feet
          </label>
          <Input
            id={feetId}
            type="number"
            min={3}
            max={8}
            inputMode="numeric"
            invalid={Boolean(errorFeet)}
            {...registerFeet}
          />
        </div>
        <div>
          <label htmlFor={inchesId} className="text-xs font-medium text-charcoal-400">
            Inches
          </label>
          <Input
            id={inchesId}
            type="number"
            min={0}
            max={11}
            inputMode="numeric"
            invalid={Boolean(errorInches)}
            {...registerInches}
          />
        </div>
      </div>
      <FieldError error={error} />
    </div>
  );
}
