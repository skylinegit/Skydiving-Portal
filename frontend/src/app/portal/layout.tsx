import type { ReactNode } from 'react';
import { PortalShell } from '@/components/portal/PortalShell';
import { SessionProvider } from '@/lib/auth';

// Wraps every authed page in a single SessionProvider so the GET /me probe
// happens once for the whole subtree. PortalShell, Header, UserMenu, and any
// page that uses `useSession()` / `useCurrentUser()` share the same data.
export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <PortalShell>{children}</PortalShell>
    </SessionProvider>
  );
}
