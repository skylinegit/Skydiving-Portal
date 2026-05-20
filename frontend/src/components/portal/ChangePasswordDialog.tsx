'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/Dialog';
import { TextField } from '@/components/forms/TextField';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { changePasswordSchema, type ChangePasswordInput } from '@/lib/validation';
import { changePassword } from '@/lib/api';

export function ChangePasswordDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await changePassword(values.currentPassword, values.newPassword);
    toast({ tone: 'success', title: 'Password updated', description: 'Use your new password next time you sign in.' });
    setOpen(false);
    reset();
  });

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" leftIcon={<KeyRound className="size-4" aria-hidden />}>
          Set new password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Update your password</DialogTitle>
        <DialogDescription>
          Enter your current password and choose a new one. You will stay signed in on this device.
        </DialogDescription>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <TextField
            label="Current password"
            type="password"
            autoComplete="current-password"
            required
            register={register('currentPassword')}
            error={errors.currentPassword}
          />
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            register={register('newPassword')}
            error={errors.newPassword}
          />
          <TextField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            required
            register={register('confirmPassword')}
            error={errors.confirmPassword}
          />
          <div className="mt-6 flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="ghost" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={isSubmitting}>
              Update password
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
