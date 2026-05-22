'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { navItems } from './nav-items';
import { Button } from '@/components/ui/Button';
import { logout } from '@/lib/auth';
import { cn } from '@/lib/cn';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="flex h-full w-full flex-col bg-navy-gradient text-cloud">
      <div className="flex items-center gap-3 px-6 pb-6 pt-7">
        <Link
          href="/portal/checklist"
          className="flex items-center"
          onClick={onNavigate}
          aria-label="Skyline Skydiving Portal"
        >
          <Image
            src="/images/skyline-logo-white.png"
            alt="Skyline Skydiving"
            width={160}
            height={64}
            priority
            className="h-10 w-auto"
          />
        </Link>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3" aria-label="Portal navigation">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-sky text-cloud shadow-sm'
                      : 'text-cloud/75 hover:bg-sky/20 hover:text-cloud hover:translate-x-0.5',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active-pill"
                      className="absolute inset-0 -z-0 rounded-lg bg-sky"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="relative z-10 size-5 shrink-0" aria-hidden />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-cloud/10 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-cloud/80 hover:bg-danger/20 hover:text-cloud"
          onClick={handleLogout}
          leftIcon={<LogOut className="size-4" aria-hidden />}
        >
          Sign out
        </Button>
      </div>
    </aside>
  );
}
