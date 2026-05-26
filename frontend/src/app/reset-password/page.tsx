'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
import { AuthShell } from '@/components/portal/AuthShell';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validation';
import { resetPassword, type ApiError } from '@/lib/api';

export default function ResetPasswordPage() {
  // useSearchParams forces client rendering; wrap in Suspense so the
  // build doesn't error and the rest of the tree can stream.
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
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
    try {
      await resetPassword(token, values.password);
      setDone(true);
    } catch (err) {
      const apiErr = err as ApiError;
      toast({
        tone: 'error',
        title: 'Could not reset password',
        description:
          apiErr?.message ??
          'The link may have expired. Request a new one and try again.',
      });
    }
  });

  if (!token && !done) {
    return (
      <AuthShell
        title="Invalid reset link"
        subtitle="This page needs a valid reset token from your email."
        footer={
          <Link
            href="/forgot-password"
            className="font-semibold text-cloud/90 hover:text-cloud"
          >
            Request a new link
          </Link>
        }
      >
        <p className="text-sm text-charcoal-400">
          The reset link in your email contains a one-time token. Please open the link directly
          from the email you received.
        </p>
      </AuthShell>
    );
  }

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
