'use client';

import { motion } from 'framer-motion';
import { Plane, Wind, Umbrella, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface Stage {
  altitude: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

const stages: Stage[] = [
  {
    altitude: '10,000ft',
    title: 'Exit the aircraft',
    description:
      'Securely attached to your instructor, you leave the plane together for the start of your freefall.',
    icon: Plane,
    accent: 'from-sky-400 to-sky-600',
  },
  {
    altitude: '120mph',
    title: 'Freefall',
    description:
      '30 to 40 seconds of belly-to-earth freefall with sweeping views across the countryside.',
    icon: Wind,
    accent: 'from-sky-500 to-sky-700',
  },
  {
    altitude: '5,000ft',
    title: 'Canopy deploys',
    description:
      'The parachute opens above you and the freefall transitions to a calm, scenic glide.',
    icon: Umbrella,
    accent: 'from-sky-300 to-sky-500',
  },
  {
    altitude: 'Landing',
    title: 'Touch down safely',
    description:
      'A smooth tandem landing back at the airfield, where your supporters can meet you.',
    icon: MapPin,
    accent: 'from-success to-emerald-600',
  },
];

export function AltitudeTimeline() {
  return (
    <Card className="relative h-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-sky/10 blur-3xl"
      />
      <header className="relative mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-sky">Your jump experience</p>
        <h2 className="mt-1 text-xl font-bold text-navy sm:text-2xl">From the door to the ground</h2>
        <p className="mt-2 text-sm text-charcoal-400">
          What happens between the plane and the landing zone.
        </p>
      </header>

      <ol className="relative space-y-5 pl-1">
        {/* Vertical track */}
        <span
          aria-hidden
          className="absolute left-[1.45rem] top-2 bottom-2 w-px bg-gradient-to-b from-sky via-sky/50 to-success"
        />
        {stages.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <motion.li
              key={stage.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.08, ease: 'easeOut' }}
              className="relative flex gap-4"
            >
              <div
                className={`relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${stage.accent} text-white shadow-card ring-4 ring-cloud`}
              >
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-sky-700">
                    {stage.altitude}
                  </span>
                  <h3 className="text-base font-bold text-navy sm:text-lg">{stage.title}</h3>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-charcoal">{stage.description}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </Card>
  );
}
