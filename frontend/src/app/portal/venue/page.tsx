'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  MapPin,
  Scale,
  AlertCircle,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/portal/PageHeader';
import { getBooking } from '@/lib/api';
import { getAirfield } from '@/content/airfields';
import { formatWeight } from '@/lib/units';
import type { AirfieldContent, BookingDetails } from '@/types';

export default function VenuePage() {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [airfield, setAirfield] = useState<AirfieldContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const bk = await getBooking();
      if (!active) return;
      setBooking(bk);
      setAirfield(getAirfield(bk.venueId));
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Your airfield"
        title={
          loading
            ? 'Venue information'
            : `${airfield?.name ?? booking?.venueName ?? 'Venue'}`
        }
        description="Everything you need to know about your booked airfield."
      />

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-48 lg:col-span-2" />
          <Skeleton className="h-48" />
          <Skeleton className="h-64 lg:col-span-3" />
          <Skeleton className="h-96 lg:col-span-3" />
        </div>
      ) : !airfield ? (
        <Card>
          <div className="flex items-start gap-3 text-charcoal-400">
            <AlertCircle className="size-5 shrink-0 text-sunburst" aria-hidden />
            <p>
              We do not have detailed information for {booking?.venueName ?? 'your booked airfield'}{' '}
              yet. Please refer to your booking confirmation email for arrival details, or contact
              the Skyline office.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Top row: summary + contact */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="relative overflow-hidden lg:col-span-2">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-sky/10 blur-3xl"
              />
              <div className="relative">
                <Badge tone="sky">{airfield.region}</Badge>
                <h2 className="mt-3 text-2xl font-bold text-navy sm:text-3xl">
                  Some important information about your airfield
                </h2>
                <p className="mt-3 text-base leading-relaxed text-charcoal">{airfield.intro}</p>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
                <CardDescription>Call the airfield directly with any questions.</CardDescription>
              </CardHeader>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-sky" aria-hidden />
                  <div>
                    <span className="block text-charcoal">{airfield.address}</span>
                    <span className="block font-mono text-xs uppercase text-charcoal-400">
                      {airfield.postcode}
                    </span>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="size-4 shrink-0 text-sky" aria-hidden />
                  <a
                    href={`tel:${airfield.phone.replace(/\s/g, '')}`}
                    className="font-semibold text-navy hover:text-sky"
                  >
                    {airfield.phone}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Scale className="size-4 shrink-0 text-sky" aria-hidden />
                  <span>
                    Weight limit:{' '}
                    <span className="font-semibold text-navy">
                      {formatWeight(airfield.weightLimitKg)}
                    </span>
                  </span>
                </li>
              </ul>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="mt-5"
                rightIcon={<ExternalLink className="size-4" aria-hidden />}
              >
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(airfield.postcode)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in maps
                </a>
              </Button>
            </Card>
          </div>

          {/* Weight surcharge + important notes */}
          {airfield.weightSurchargeNote && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-card border border-sunburst/30 bg-sunburst-50 p-4 text-sm text-charcoal"
            >
              <Info className="mt-0.5 size-5 shrink-0 text-sunburst" aria-hidden />
              <span>{airfield.weightSurchargeNote}</span>
            </div>
          )}

          {airfield.importantNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Before your jump</CardTitle>
              </CardHeader>
              <ul className="space-y-3 text-base leading-relaxed text-charcoal">
                {airfield.importantNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-2 block size-1.5 shrink-0 rounded-full bg-sky"
                    />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Sections: When?, Weather, Where?, etc. */}
          <div className="grid gap-6 md:grid-cols-2">
            {airfield.sections.map((section) => (
              <Card key={section.heading} className="flex flex-col">
                <h3 className="text-lg font-bold text-navy">{section.heading}</h3>
                <div className="mt-3 space-y-2 text-base leading-relaxed text-charcoal">
                  {section.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Map */}
          <Card>
            <CardHeader>
              <CardTitle>Map</CardTitle>
              <CardDescription>
                {airfield.address}, {airfield.postcode}
              </CardDescription>
            </CardHeader>
            <div className="overflow-hidden rounded-lg border border-navy/[0.06]">
              <iframe
                title={`Map showing ${airfield.name}`}
                src={airfield.mapEmbedUrl}
                width="100%"
                height="420"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block w-full"
              />
            </div>
          </Card>

          {/* Helpful link to profile */}
          <Card className="lg:col-span-3">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-navy">Need to change your airfield?</h3>
                <p className="text-sm text-charcoal-400">
                  You can request a venue change from your profile page. Prices and fundraising
                  minimums vary by airfield.
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href="/portal/profile">Go to Profile</Link>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
