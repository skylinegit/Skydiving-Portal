'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Next.js App Router error boundary for /portal/* routes.
// Caught errors here are rendered instead of unmounting the whole layout.
export default function PortalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // When a real error reporter (e.g. Sentry) is added, forward here.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('[portal] runtime error', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-danger/10">
          <AlertTriangle className="size-6 text-danger" aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-navy">Something went wrong</h1>
        <p className="mt-2 text-sm text-charcoal-400">
          We could not load this page. Try again, and if it keeps happening contact the Skyline
          team.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs font-mono text-charcoal-300">Ref: {error.digest}</p>
        )}
        <Button
          className="mt-6"
          onClick={() => reset()}
          leftIcon={<RotateCw className="size-4" aria-hidden />}
        >
          Try again
        </Button>
      </Card>
    </div>
  );
}
