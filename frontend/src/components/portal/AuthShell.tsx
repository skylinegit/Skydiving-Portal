import Image from 'next/image';
import type { ReactNode } from 'react';
import { VantaBackdrop } from './VantaBackdrop';
import { cn } from '@/lib/cn';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthShell({ title, subtitle, children, footer, className }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-navy text-cloud">
      {/* 3D animated cloudscape (WebGL) */}
      <VantaBackdrop />

      {/* Dark vignette so the form card stays readable over the moving sky */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/15 to-navy/70"
      />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className={cn('w-full max-w-md', className)}>
          {/* Logo + heading */}
          <div className="mb-7 flex flex-col items-center text-center">
            <Image
              src="/images/skyline-logo-white.png"
              alt="Skyline Skydiving"
              width={220}
              height={88}
              priority
              className="mb-6 h-16 w-auto drop-shadow-[0_6px_24px_rgba(0,159,227,0.55)]"
            />
            <h1 className="text-3xl font-bold text-cloud drop-shadow-[0_2px_12px_rgba(7,30,61,0.6)] sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-sm text-sm text-cloud/85 drop-shadow-[0_1px_6px_rgba(7,30,61,0.4)]">
                {subtitle}
              </p>
            )}
          </div>

          {/* Card: glassmorphism with gradient top accent and soft outer halo */}
          <div className="relative animate-fade-in-up">
            {/* Soft outer halo so the card "lifts" off the sky */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-sky/20 opacity-50 blur-3xl"
            />
            <div className="relative overflow-hidden rounded-[1.25rem] bg-cloud/90 shadow-[0_24px_80px_-12px_rgba(7,30,61,0.55)] ring-1 ring-cloud/50 backdrop-blur-xl">
              {/* Top gradient accent strip */}
              <div
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky via-sky-300 to-sunburst"
              />
              {/* Decorative corner glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-sky/15 blur-3xl"
              />
              <div className="relative p-7 text-charcoal sm:p-9">{children}</div>
            </div>
          </div>

          {footer && <div className="mt-6 text-center text-sm text-cloud/85">{footer}</div>}
        </div>
      </div>

      <footer className="relative z-10 px-6 pb-6 text-center text-xs text-cloud/60">
        &copy; {new Date().getFullYear()} Skyline Skydiving. All rights reserved.
      </footer>
    </main>
  );
}
