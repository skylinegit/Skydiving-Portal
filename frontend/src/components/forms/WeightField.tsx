'use client';

import { useId, type ReactNode } from 'react';
import type { FieldError as RhfFieldError, UseFormRegisterReturn } from 'react-hook-form';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { FieldError } from './FieldError';
import { cn } from '@/lib/cn';

interface WeightFieldProps {
  label?: string;
  hint?: ReactNode;
  required?: boolean;
  registerStone: UseFormRegisterReturn;
  registerPounds: UseFormRegisterReturn;
  errorStone?: RhfFieldError;
  errorPounds?: RhfFieldError;
  containerClassName?: string;
}

export function WeightField({
  label = 'Weight',
  hint,
  required,
  registerStone,
  registerPounds,
  errorStone,
  errorPounds,
  containerClassName,
}: WeightFieldProps) {
  const stoneId = useId();
  const poundsId = useId();
  const error = errorStone ?? errorPounds;
  return (
    <div className={cn('w-full', containerClassName)}>
      <Label required={required}>{label}</Label>
      {hint && <p className="-mt-1 mb-2 text-sm text-charcoal-400">{hint}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={stoneId} className="text-xs font-medium text-charcoal-400">
            Stone
          </label>
          <Input
            id={stoneId}
            type="number"
            min={5}
            max={40}
            inputMode="numeric"
            invalid={Boolean(errorStone)}
            {...registerStone}
          />
        </div>
        <div>
          <label htmlFor={poundsId} className="text-xs font-medium text-charcoal-400">
            Pounds
          </label>
          <Input
            id={poundsId}
            type="number"
            min={0}
            max={13}
            inputMode="numeric"
            invalid={Boolean(errorPounds)}
            {...registerPounds}
          />
        </div>
      </div>
      <FieldError error={error} />
    </div>
  );
}
