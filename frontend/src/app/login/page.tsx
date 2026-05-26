'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { AuthShell } from '@/components/portal/AuthShell';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { loginSchema, type LoginInput } from '@/lib/validation';
import { login } from '@/lib/api';
import { loginMock } from '@/lib/auth';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login(values.email, values.password);
      loginMock(user.account.email);
      toast({ tone: 'success', title: 'Welcome back', description: 'You are now signed in.' });
      router.push('/portal/checklist');
    } catch {
      toast({
        tone: 'error',
        title: 'Could not sign in',
        description: 'Please check your details and try again.',
      });
    }
  });

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to manage your jump booking, forms and fundraising."
      footer={
        <div className="space-y-1">
          <p>
            Already booked your jump?{' '}
            <Link
              href="/register"
              className="font-semibold text-cloud underline-offset-2 hover:underline"
            >
              Create your portal account
            </Link>
            .
          </p>
          <p className="text-cloud/70">
            Not booked yet?{' '}
            <a
              href="https://www.skylineskydiving.co.uk"
              className="font-semibold text-cloud underline-offset-2 hover:underline"
            >
              Book a skydive
            </a>{' '}
            first.
          </p>
        </div>
      }
    >
      <motion.form
        onSubmit={onSubmit}
        noValidate
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
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
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
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

        <motion.div variants={item} className="flex justify-end text-sm">
          <Link
            href="/forgot-password"
            className="font-semibold text-sky-600 transition-colors hover:text-sky-700"
          >
            Forgot password?
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting || undefined}
            className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-pill bg-gradient-to-r from-sky to-sky-600 px-6 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,159,227,0.6)] transition-all hover:from-sky-500 hover:to-sky-700 hover:shadow-[0_12px_32px_-8px_rgba(0,159,227,0.8)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-cloud"
          >
            {/* Sheen sweep on hover */}
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/0 via-white/30 to-white/0 transition-transform duration-700 group-hover:translate-x-full"
            />
            <span className="relative">{isSubmitting ? 'Signing in…' : 'Sign in'}</span>
            <ArrowRight
              className="relative size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </button>
        </motion.div>

        <motion.div
          variants={item}
          className="flex items-center justify-center gap-2 pt-2 text-xs text-charcoal-400"
        >
          <ShieldCheck className="size-3.5 text-success" aria-hidden />
          <span>Secure, encrypted sign-in</span>
        </motion.div>
      </motion.form>
    </AuthShell>
  );
}
