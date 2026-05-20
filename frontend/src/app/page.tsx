'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';
import { getSession } from '@/lib/auth';

export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    router.replace(session ? '/portal/checklist' : '/login');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-soft-gradient">
      <Spinner label="Loading Skyline portal" />
    </main>
  );
}
