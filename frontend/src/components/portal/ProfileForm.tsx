'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { TextField } from '@/components/forms/TextField';
import { SelectField } from '@/components/forms/SelectField';
import { DateField } from '@/components/forms/DateField';
import { SwitchField } from '@/components/forms/SwitchField';
import { HeightField } from '@/components/forms/HeightField';
import { WeightField } from '@/components/forms/WeightField';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { profileSchema, type ProfileInput } from '@/lib/validation';
import { updateProfile } from '@/lib/api';
import {
  cmToFeetInches,
  feetInchesToCm,
  kgToStonePounds,
  stonePoundsToKg,
} from '@/lib/units';
import type { UserProfile } from '@/types';

interface ProfileFormProps {
  profile: UserProfile;
  onProfileUpdate: (next: UserProfile) => void;
}

const sexOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export function ProfileForm({ profile, onProfileUpdate }: ProfileFormProps) {
  const { toast } = useToast();
  const initialHeight = cmToFeetInches(profile.heightCm);
  const initialWeight = kgToStonePounds(profile.weightKg);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: profile.phone,
      dob: profile.dob,
      sex: profile.sex,
      fundraisingUrl: profile.fundraisingUrl ?? '',
      heightFeet: initialHeight.feet,
      heightInches: initialHeight.inches,
      weightStone: initialWeight.stone,
      weightPounds: initialWeight.pounds,
      termsAccepted: profile.termsAccepted as true,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const next: UserProfile = {
      phone: values.phone,
      dob: values.dob,
      sex: values.sex,
      fundraisingUrl: values.fundraisingUrl?.trim() ? values.fundraisingUrl : null,
      heightCm: feetInchesToCm({ feet: values.heightFeet, inches: values.heightInches }),
      weightKg: stonePoundsToKg({ stone: values.weightStone, pounds: values.weightPounds }),
      termsAccepted: values.termsAccepted,
    };
    const saved = await updateProfile(next);
    onProfileUpdate(saved);
    reset(values);
    toast({
      tone: 'success',
      title: 'Profile updated',
      description: 'Your details have been saved.',
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>To-do list</CardTitle>
        <CardDescription>
          Complete your jumper profile. Heights and weights are entered in feet/inches and
          stone/pounds.
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <TextField
          label="Phone number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="07800 123456"
          hint="Please enter a number the venue can reach you on."
          register={register('phone')}
          error={errors.phone}
        />

        <DateField
          label="Date of birth"
          required
          register={register('dob')}
          error={errors.dob}
        />

        <Controller
          control={control}
          name="sex"
          render={({ field, fieldState }) => (
            <SelectField
              label="Sex"
              required
              options={sexOptions}
              value={field.value}
              onValueChange={field.onChange}
              error={fieldState.error}
            />
          )}
        />

        <TextField
          label="External fundraising page"
          type="url"
          inputMode="url"
          placeholder="https://www.justgiving.com/yourname"
          hint={
            <>
              Must start with https:// and link directly to your page. The charity on your page
              must match the charity for your jump.
            </>
          }
          register={register('fundraisingUrl')}
          error={errors.fundraisingUrl}
        />

        <HeightField
          required
          registerFeet={register('heightFeet', { valueAsNumber: true })}
          registerInches={register('heightInches', { valueAsNumber: true })}
          errorFeet={errors.heightFeet}
          errorInches={errors.heightInches}
        />

        <WeightField
          required
          hint="All jumpers are weighed at the airfield. Limits vary by venue."
          registerStone={register('weightStone', { valueAsNumber: true })}
          registerPounds={register('weightPounds', { valueAsNumber: true })}
          errorStone={errors.weightStone}
          errorPounds={errors.weightPounds}
        />

        <Controller
          control={control}
          name="termsAccepted"
          render={({ field, fieldState }) => (
            <SwitchField
              label="I accept the terms and conditions"
              required
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => field.onChange(checked || undefined)}
              description={
                <>
                  You must accept the{' '}
                  <a
                    href="https://www.skylineskydiving.co.uk/terms"
                    className="font-semibold text-sky hover:text-sky-700"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Skyline terms and conditions
                  </a>{' '}
                  before your jump.
                </>
              }
              error={fieldState.error}
            />
          )}
        />

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isDirty}
            leftIcon={<Save className="size-4" aria-hidden />}
          >
            Update profile
          </Button>
        </div>
      </form>
    </Card>
  );
}
