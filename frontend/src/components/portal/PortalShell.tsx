'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Spinner } from '@/components/ui/Spinner';
import { useSession } from '@/lib/auth';

const SIDEBAR_WIDTH = 280;

export function PortalShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // useSession is async-aware: in real mode it probes `GET /me` and only
  // resolves once we know whether the cookie is valid. In mock mode it
  // reads localStorage synchronously.
  const { session, loading } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login');
    }
  }, [loading, session, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Show spinner while the session check is in flight, OR after it has
  // resolved to "no session" and we are about to redirect. Without this
  // guard the portal would render its layout briefly and the user would
  // see a flash of an empty shell.
  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft-gradient">
        <Spinner label="Loading your portal" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-soft">
      {/* Desktop sidebar */}
      <div
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <motion.aside
              key="drawer"
              initial={{ x: -SIDEBAR_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_WIDTH }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex w-full flex-col lg:pl-[280px]">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
