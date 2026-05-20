import type { Metadata, Viewport } from 'next';
import { Montserrat, Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/Toast';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Skyline Skydiving Portal',
    template: '%s · Skyline Skydiving',
  },
  description:
    'Manage your booking, view venue information, download forms and track fundraising for your tandem skydive with Skyline Skydiving.',
};

export const viewport: Viewport = {
  themeColor: '#071E3D',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${montserrat.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-soft text-charcoal antialiased">
        <a
          href="#main-content"
          className="sr-only z-50 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded focus:bg-navy focus:px-4 focus:py-2 focus:text-cloud"
        >
          Skip to content
        </a>
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
