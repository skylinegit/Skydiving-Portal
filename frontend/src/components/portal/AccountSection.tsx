'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LogOut, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { useToast } from '@/components/ui/Toast';
import { changeEmailSchema, type ChangeEmailInput } from '@/lib/validation';
import { changeEmail, logOutOtherSessions } from '@/lib/api';
import { useSessionRefresh } from '@/lib/auth';
import type { UserAccount } from '@/types';

interface AccountSectionProps {
  account: UserAccount;
  onAccountUpdate: (next: UserAccount) => void;
}

export function AccountSection({ account, onAccountUpdate }: AccountSectionProps) {
  const { toast } = useToast();
  const refreshSession = useSessionRefresh();
  const [loggingOut, setLoggingOut] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ChangeEmailInput>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: account.email },
  });

  const onEmailSubmit = handleSubmit(async (values) => {
    if (values.newEmail === account.email) return;
    const res = await changeEmail(values.newEmail);
    onAccountUpdate({ ...account, pendingEmailChange: res.pendingEmail });
    void refreshSession();
    toast({
      tone: 'success',
      title: 'Confirmation email sent',
      description: `A link has been sent to ${res.pendingEmail}. Click it to activate.`,
    });
    reset({ newEmail: values.newEmail });
  });

  const handleLogoutOthers = async () => {
    try {
      setLoggingOut(true);
      await logOutOtherSessions();
      toast({ tone: 'success', title: 'Signed out', description: 'All other devices have been signed out.' });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Update your sign-in details and manage active sessions.
        </CardDescription>
      </CardHeader>

      <form onSubmit={onEmailSubmit} className="space-y-5" noValidate>
        <div>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            register={register('newEmail')}
            error={errors.newEmail}
            hint={
              account.pendingEmailChange ? (
                <span className="text-sunburst-600">
                  Pending confirmation for {account.pendingEmailChange}. The new address becomes active when you click the link in the email.
                </span>
              ) : (
                'If you change this, an email will be sent to your new address to confirm it. The new address will not become active until confirmed.'
              )
            }
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              loading={isSubmitting}
              disabled={!isDirty}
              leftIcon={<Mail className="size-4" aria-hidden />}
            >
              Update email
            </Button>
            {account.pendingEmailChange && <Badge tone="sunburst">Confirmation pending</Badge>}
          </div>
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-3 border-t border-navy/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-navy">Password</h3>
          <p className="text-sm text-charcoal-400">
            Change your password regularly to keep your account secure.
          </p>
        </div>
        <ChangePasswordDialog />
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-navy/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-navy">Sessions</h3>
          <p className="text-sm text-charcoal-400">
            Did you lose your phone or leave your account logged in on a shared computer? Log out everywhere else and stay signed in here.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          loading={loggingOut}
          onClick={handleLogoutOthers}
          leftIcon={<LogOut className="size-4" aria-hidden />}
        >
          Log out everywhere else
        </Button>
      </div>
    </Card>
  );
}
