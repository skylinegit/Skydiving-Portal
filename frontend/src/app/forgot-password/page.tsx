'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck, ArrowLeft } from 'lucide-react';
import { AuthShell } from '@/components/portal/AuthShell';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validation';
import { forgotPassword } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await forgotPassword(values.email);
    setSent(true);
  });

  return (
    <AuthShell
      title={sent ? 'Check your inbox' : 'Reset your password'}
      subtitle={
        sent
          ? `If an account exists for ${getValues('email')}, we have sent a reset link.`
          : 'Enter your email and we will send you a link to set a new password.'
      }
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-cloud/90 hover:text-cloud"
        >
          <ArrowLeft className="size-4" aria-hidden /> Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-4 py-4 text-center animate-fade-in">
          <div className="rounded-full bg-success/10 p-3">
            <MailCheck className="size-8 text-success" aria-hidden />
          </div>
          <p className="text-sm text-charcoal-400">
            The link will expire in 30 minutes. Check your spam folder if it does not arrive
            within a few minutes.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            register={register('email')}
            error={errors.email}
          />
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
