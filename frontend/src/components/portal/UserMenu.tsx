'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, LogOut, Settings, UserCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { logout, useSession } from '@/lib/auth';

interface UserMenuProps {
  displayName: string;
}

export function UserMenu({ displayName }: UserMenuProps) {
  const router = useRouter();
  const { session } = useSession();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2 rounded-pill bg-soft px-3 py-1.5 text-sm font-medium text-navy transition-colors hover:bg-sky/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky focus-visible:ring-offset-2 focus-visible:ring-offset-cloud"
          aria-label="Open user menu"
        >
          <UserCircle2 className="size-5 text-sky" aria-hidden />
          <span className="hidden max-w-[10rem] truncate sm:inline">Hi, {displayName}</span>
          <span className="inline sm:hidden">Hi</span>
          <ChevronDown
            className="size-4 text-charcoal-400 transition-transform group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
        <div className="flex items-center gap-3 px-3 pb-2 pt-1">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky/10 text-sky">
            <UserCircle2 className="size-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-navy">{displayName}</p>
            {session?.email && (
              <p className="truncate text-xs text-charcoal-400">{session.email}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/portal/settings">
            <Settings className="size-4 text-charcoal-400" aria-hidden />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={handleLogout}>
          <LogOut className="size-4" aria-hidden />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
