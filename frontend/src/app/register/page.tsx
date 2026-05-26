'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Hash,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import { AuthShell } from '@/components/portal/AuthShell';
import { TextField } from '@/components/forms/TextField';
import { useToast } from '@/components/ui/Toast';
import { registerSchema, type RegisterInput } from '@/lib/validation';
import { register as registerApi, type ApiError } from '@/lib/api';
import { loginMock } from '@/lib/auth';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      bookingReference: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await registerApi({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        bookingReference: values.bookingReference,
      });
      loginMock(user.account.email);
      toast({
        tone: 'success',
        title: 'Account created',
        description: 'Welcome aboard. Your booking is linked.',
      });
      router.push('/portal/checklist');
    } catch (err) {
      const apiErr = err as ApiError;
      toast({
        tone: 'error',
        title: 'Could not create your account',
        description:
          apiErr?.message ??
          'Please check your booking reference and details, then try again.',
      });
    }
  });

  return (
    <AuthShell
      title="Create your portal account"
      subtitle="Already booked your jump? Set up your portal access to manage your booking."
      footer={
        <p>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-cloud underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
          .
        </p>
      }
    >
      <motion.form
        onSubmit={onSubmit}
        noValidate
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            type="text"
            autoComplete="given-name"
            required
            placeholder="Alex"
            leftIcon={<User className="size-4" />}
            register={register('firstName')}
            error={errors.firstName}
          />
          <TextField
            label="Last name"
            type="text"
            autoComplete="family-name"
            required
            placeholder="Taylor"
            register={register('lastName')}
            error={errors.lastName}
          />
        </motion.div>

        <motion.div variants={item}>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            leftIcon={<Mail className="size-4" />}
            register={register('email')}
            error={errors.email}
          />
        </motion.div>

        <motion.div variants={item}>
          <TextField
            label="Booking reference"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            required
            placeholder="e.g. 12345"
            hint="Find this in your Skyline booking confirmation email."
            leftIcon={<Hash className="size-4" />}
            register={register('bookingReference')}
            error={errors.bookingReference}
          />
        </motion.div>

        <motion.div variants={item}>
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="At least 8 characters"
            leftIcon={<Lock className="size-4" />}
            rightAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="flex size-8 items-center justify-center rounded-md text-charcoal-300 transition-colors hover:bg-soft hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            }
            register={register('password')}
            error={errors.password}
          />
        </motion.div>

        <motion.div variants={item}>
          <TextField
            label="Confirm password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            required
            placeholder="Re-enter your password"
            leftIcon={<Lock className="size-4" />}
            rightAdornment={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="flex size-8 items-center justify-center rounded-md text-charcoal-300 transition-colors hover:bg-soft hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                aria-pressed={showConfirm}
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            }
            register={register('confirmPassword')}
            error={errors.confirmPassword}
          />
        </motion.div>

        <motion.div variants={item}>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting || undefined}
            className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-pill bg-gradient-to-r from-sky to-sky-600 px-6 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,159,227,0.6)] transition-all hover:from-sky-500 hover:to-sky-700 hover:shadow-[0_12px_32px_-8px_rgba(0,159,227,0.8)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-cloud"
          >
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 transition-transform duration-700 group-hover:translate-x-full"
            />
            <span className="relative">{isSubmitting ? 'Creating account…' : 'Create account'}</span>
            <ArrowRight
              className="relative size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </button>
        </motion.div>

        <motion.div
          variants={item}
          className="flex items-center justify-center gap-2 pt-1 text-xs text-charcoal-400"
        >
          <ShieldCheck className="size-3.5 text-success" aria-hidden />
          <span>Secure, encrypted registration</span>
        </motion.div>
      </motion.form>
    </AuthShell>
  );
}
