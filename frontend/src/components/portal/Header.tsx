'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { UserMenu } from './UserMenu';
import { useSession } from '@/lib/auth';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { session } = useSession();
  const rawName = session?.email?.split('@')[0]?.split(/[._-]/)[0] ?? 'jumper';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-navy/5 bg-cloud/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="size-5" aria-hidden />
        </Button>
        <p className="hidden text-sm text-charcoal-400 sm:block">
          Welcome back, <span className="font-semibold text-navy">{displayName}</span>
        </p>
      </div>

      <UserMenu displayName={displayName} />
    </header>
  );
}
