'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function HelpBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden bg-navy-gradient text-cloud">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-sky/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-16 size-56 rounded-full bg-sunburst/10 blur-3xl"
        />
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <div className="rounded-pill bg-cloud/10 p-3 backdrop-blur-sm">
              <MessageCircle className="size-6 text-sky-200" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
                We are here to help
              </p>
              <h3 className="mt-1 text-xl font-bold text-cloud sm:text-2xl">
                Questions about your jump?
              </h3>
              <p className="mt-1 max-w-md text-sm text-cloud/80">
                The Skyline team will guide you through anything from forms to weather queries.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="tel:02074245522"
              className="group inline-flex items-center gap-2 rounded-pill border border-cloud/20 bg-cloud/[0.08] px-4 py-2 text-sm font-semibold text-cloud transition-all hover:-translate-y-0.5 hover:border-cloud/40 hover:bg-cloud/15"
            >
              <Phone className="size-4 text-sky-200" aria-hidden />
              0207 424 5522
            </a>
            <a
              href="mailto:myskydive@skylineevents.co.uk"
              className="group inline-flex items-center gap-2 rounded-pill border border-cloud/20 bg-cloud/[0.08] px-4 py-2 text-sm font-semibold text-cloud transition-all hover:-translate-y-0.5 hover:border-cloud/40 hover:bg-cloud/15"
            >
              <Mail className="size-4 text-sky-200" aria-hidden />
              Email Skyline
            </a>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
