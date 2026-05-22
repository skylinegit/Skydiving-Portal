'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/portal/PageHeader';
import { AccountSection } from '@/components/portal/AccountSection';
import { useCurrentUser } from '@/lib/auth';
import type { UserAccount } from '@/types';

export default function SettingsPage() {
  const ctxUser = useCurrentUser();
  const [user, setUser] = useState(ctxUser);

  useEffect(() => {
    setUser(ctxUser);
  }, [ctxUser]);

  const handleAccountUpdate = (next: UserAccount) => {
    setUser((prev) => (prev ? { ...prev, account: next } : prev));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Account settings"
        description="Update your sign-in details, change your password and manage active sessions."
      />

      {!user ? (
        <Skeleton className="h-96" />
      ) : (
        <AccountSection account={user.account} onAccountUpdate={handleAccountUpdate} />
      )}
    </div>
  );
}
