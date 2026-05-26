'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MailCheck, ShieldCheck } from 'lucide-react';
import { AuthShell } from '@/components/portal/AuthShell';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { confirmEmailChange, type ApiError } from '@/lib/api';

export default function ConfirmEmailPage() {
  // useSearchParams forces client rendering; Suspense wrap keeps the build
  // happy and lets the rest of the tree stream.
  return (
    <Suspense fallback={null}>
      <ConfirmEmailContent />
    </Suspense>
  );
}

function ConfirmEmailContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Deliberately not auto-confirming on mount. Some corporate mail scanners
  // (Outlook Safe Links, antivirus prefetchers) follow links in emails to
  // check them, which would silently apply the change without the user's
  // intent. A button click is the explicit consent.
  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await confirmEmailChange(token);
      setDone(true);
    } catch (err) {
      const apiErr = err as ApiError;
      toast({
        tone: 'error',
        title: 'Could not confirm email change',
        description:
          apiErr?.message ??
          'The link may have expired. Request a new one from Settings.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <AuthShell
        title="Invalid confirmation link"
        subtitle="This page needs a valid token from your confirmation email."
        footer={
          <Link href="/login" className="font-semibold text-cloud/90 hover:text-cloud">
            Back to sign in
          </Link>
        }
      >
        <p className="text-sm text-charcoal-400">
          The confirmation link in your email contains a one-time token. Please open the link
          directly from the email you received.
        </p>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell
        title="Email updated"
        subtitle="Your sign-in email has been changed. Use the new address next time you sign in."
        footer={
          <Link href="/login" className="font-semibold text-cloud/90 hover:text-cloud">
            Back to sign in
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center animate-fade-in">
          <div className="rounded-full bg-success/10 p-3">
            <ShieldCheck className="size-8 text-success" aria-hidden />
          </div>
          <Button asChild size="lg" className="mt-2 w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Confirm your new email"
      subtitle="Click below to apply the email change on your Skyline portal account."
      footer={
        <Link href="/login" className="font-semibold text-cloud/90 hover:text-cloud">
          Back to sign in
        </Link>
      }
    >
      <div className="flex flex-col items-center gap-5 py-2 text-center">
        <div className="rounded-full bg-sky/10 p-3">
          <MailCheck className="size-8 text-sky" aria-hidden />
        </div>
        <p className="text-sm text-charcoal-400">
          We received a request to change the email on your account. Confirming will replace your
          current sign-in email with the one this confirmation link was sent to.
        </p>
        <Button
          type="button"
          size="lg"
          className="w-full"
          loading={submitting}
          onClick={handleConfirm}
        >
          Confirm email change
        </Button>
      </div>
    </AuthShell>
  );
}
