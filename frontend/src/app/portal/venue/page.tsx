'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  BedDouble,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  Cloud,
  ExternalLink,
  Map as MapIcon,
  MapPin,
  Phone,
  Scale,
  Shirt,
  ShieldCheck,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
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
      try {
        const bk = await getBooking();
        if (!active) return;
        setBooking(bk);
        setAirfield(getAirfield(bk.venueId));
      } catch {
        if (active) {
          setBooking(null);
          setAirfield(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-72" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!airfield) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Your airfield" title="Venue information" />
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
      </div>
    );
  }

  const phoneTel = airfield.phone.replace(/\s/g, '');
  const mapHref = `https://www.google.com/maps/search/${encodeURIComponent(
    `${airfield.address}, ${airfield.postcode}`,
  )}`;

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------------------- */}
      {/* Hero card: eyebrow + name + address + 4 info tiles + 2 buttons   */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal-300">
          <MapPin className="size-3.5" aria-hidden />
          Your airfield · {airfield.region}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{airfield.name}</h1>
        <p className="mt-2 text-base text-charcoal-400">
          {airfield.address}, <span className="font-mono uppercase">{airfield.postcode}</span>
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <InfoTile
            icon={<CalendarDays className="size-4" aria-hidden />}
            label="Arrival time"
            value="See confirmation email"
          />
          <InfoTile
            icon={<Cloud className="size-4" aria-hidden />}
            label="Weather policy"
            value="Attend regardles"
          />
          <InfoTile
            icon={<Scale className="size-4" aria-hidden />}
            label="Weight limit"
            value={formatWeight(airfield.weightLimitKg)}
          />
          <InfoTile
            icon={<Phone className="size-4" aria-hidden />}
            label="Airfield"
            value={airfield.phone}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            asChild
            variant="secondary"
            size="sm"
            leftIcon={<MapIcon className="size-4" aria-hidden />}
          >
            <a href={mapHref} target="_blank" rel="noopener noreferrer">
              Open in maps
            </a>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="sm"
            leftIcon={<Phone className="size-4" aria-hidden />}
          >
            <a href={`tel:${phoneTel}`}>Call airfield</a>
          </Button>
        </div>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Weight surcharge banner (only when the airfield specifies one)    */}
      {/* ---------------------------------------------------------------- */}
      {airfield.weightSurchargeNote && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-card border border-sunburst-200 bg-sunburst-50 p-4 text-base leading-relaxed text-charcoal"
        >
          <AlertTriangle
            className="mt-0.5 size-5 shrink-0 text-sunburst-600"
            aria-hidden
          />
          <span>{airfield.weightSurchargeNote}</span>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Before your jump: important notes as check bullets                */}
      {/* ---------------------------------------------------------------- */}
      {airfield.importantNotes.length > 0 && (
        <Card>
          <h2 className="flex items-center gap-2 text-xl font-bold text-navy sm:text-2xl">
            <ShieldCheck className="size-5 text-sky" aria-hidden />
            Before your jump
          </h2>
          <ul className="mt-5 space-y-4">
            {airfield.importantNotes.map((note, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-charcoal-200 bg-cloud"
                >
                  <CheckCircle2 className="size-3 text-charcoal-300" aria-hidden />
                </span>
                <span className="text-base leading-relaxed text-charcoal">{note}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Good to know: sections rendered as a collapsible accordion        */}
      {/* ---------------------------------------------------------------- */}
      {airfield.sections.length > 0 && (
        <Card className="overflow-hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-charcoal-300">
            Good to know
          </p>
          {/* All collapsed by default; users can open multiple. */}
          <Accordion type="multiple">
            {airfield.sections.map((section) => (
              <AccordionItem key={section.heading} value={section.heading}>
                <AccordionTrigger>
                  <span className="flex items-center gap-2.5">
                    <span className="text-charcoal-400">
                      {iconForSection(section.heading)}
                    </span>
                    <span>{prettifyHeading(section.heading)}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className={i > 0 ? 'mt-3' : undefined}>
                      {p}
                    </p>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Map (kept as-is per the brief)                                    */}
      {/* ---------------------------------------------------------------- */}
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

      {/* ---------------------------------------------------------------- */}
      {/* Need to change your airfield? — compact CTA bar                   */}
      {/* ---------------------------------------------------------------- */}
      <Card>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-bold text-navy">Need to change your airfield?</h3>
            <p className="text-sm text-charcoal-400">
              Prices and fundraising minimums vary by location.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/portal/profile">Go to profile</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Local components / helpers
// ----------------------------------------------------------------------------

interface InfoTileProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function InfoTile({ icon, label, value }: InfoTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-navy/[0.08] bg-cloud p-3">
      <span className="flex items-center gap-1.5 text-xs font-medium text-charcoal-400">
        <span className="text-charcoal-300">{icon}</span>
        {label}
      </span>
      <p className="text-sm font-semibold text-navy">{value}</p>
    </div>
  );
}

/** Map a section heading (case-insensitive substring) to a small icon. */
function iconForSection(heading: string): ReactNode {
  const h = heading.toLowerCase();
  if (h.includes('when')) return <CalendarDays className="size-4" aria-hidden />;
  if (h.includes('weather')) return <Cloud className="size-4" aria-hidden />;
  if (h.includes('where') || h.includes('getting'))
    return <MapPin className="size-4" aria-hidden />;
  if (h.includes('wear')) return <Shirt className="size-4" aria-hidden />;
  if (h.includes('procedure') || h.includes('day'))
    return <ClipboardList className="size-4" aria-hidden />;
  if (h.includes('facilities') || h.includes('spectator'))
    return <Building2 className="size-4" aria-hidden />;
  if (h.includes('photo') || h.includes('video')) return <Camera className="size-4" aria-hidden />;
  if (h.includes('accommodation') || h.includes('stay'))
    return <BedDouble className="size-4" aria-hidden />;
  if (h.includes('payment') || h.includes('cost') || h.includes('sponsorship'))
    return <ExternalLink className="size-4" aria-hidden />;
  return <CheckCircle2 className="size-4" aria-hidden />;
}

/** Strip trailing punctuation like the "?" on "When?" / "Where?" headings. */
function prettifyHeading(heading: string): string {
  return heading.replace(/[?:.]\s*$/, '');
}
