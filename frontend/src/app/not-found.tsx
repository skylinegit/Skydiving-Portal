import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-gradient px-4 text-cloud">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-16 size-72 rounded-full bg-sky/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 size-96 rounded-full bg-sky/10 blur-3xl"
      />

      <div className="relative w-full max-w-md text-center">
        <Image
          src="/images/skyline-logo-white.png"
          alt="Skyline Skydiving"
          width={200}
          height={80}
          priority
          className="mx-auto mb-8 h-14 w-auto opacity-90"
        />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
          404
        </p>
        <h1 className="mt-3 text-4xl font-bold text-cloud sm:text-5xl">
          Off course
        </h1>
        <p className="mt-3 text-base text-cloud/80">
          The page you were looking for does not exist or has moved.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden />
            Back to the portal
          </Link>
        </Button>
      </div>
    </main>
  );
}
