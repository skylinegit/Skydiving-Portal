'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
import { AuthShell } from '@/components/portal/AuthShell';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validation';
import { resetPassword } from '@/lib/api';

export default function ResetPasswordPage() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await resetPassword('mock-token', values.password);
    setDone(true);
  });

  return (
    <AuthShell
      title={done ? 'Password updated' : 'Set a new password'}
      subtitle={
        done
          ? 'Your password has been updated. You can now sign in with the new password.'
          : 'Choose a strong password of at least 8 characters.'
      }
      footer={
        <Link href="/login" className="font-semibold text-cloud/90 hover:text-cloud">
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center animate-fade-in">
          <div className="rounded-full bg-success/10 p-3">
            <ShieldCheck className="size-8 text-success" aria-hidden />
          </div>
          <Button asChild size="lg" className="mt-2 w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            register={register('password')}
            error={errors.password}
          />
          <TextField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            register={register('confirmPassword')}
            error={errors.confirmPassword}
          />
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
