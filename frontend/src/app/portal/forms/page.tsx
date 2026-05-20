import { FileText, Download, Printer, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/portal/PageHeader';
import { formsContent } from '@/content/forms';

export const metadata = {
  title: 'My Forms',
};

export default function FormsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Downloads"
        title={formsContent.heading}
        description={formsContent.intro}
      />

      <div className="space-y-6">
        {formsContent.groups.map((group) => (
          <Card key={group.id}>
            <p className="text-sm font-semibold uppercase tracking-wider text-sky">
              {group.label}
            </p>
            <ul className="mt-4 space-y-3">
              {group.documents.map((doc) => (
                <li
                  key={doc.id}
                  className="group flex flex-col items-start justify-between gap-3 rounded-lg border border-navy/[0.06] bg-soft px-4 py-3 transition-colors hover:border-sky/40 hover:bg-soft sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-pill bg-sky/10 p-2">
                      <FileText className="size-4 text-sky" aria-hidden />
                    </div>
                    <span className="text-base font-semibold text-navy">{doc.title}</span>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="secondary"
                    leftIcon={<Download className="size-4" aria-hidden />}
                  >
                    <a href={`/pdfs/${doc.filename}`} download>
                      Download PDF
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      {/* Closing guidance */}
      <Card className="border-sunburst/30 bg-sunburst-50">
        <div className="flex items-start gap-3">
          <AlertCircle
            className="mt-0.5 size-5 shrink-0 text-sunburst"
            aria-hidden
          />
          <p className="text-base leading-relaxed text-charcoal">{formsContent.closing}</p>
        </div>
      </Card>

      {/* Tip */}
      <Card className="bg-soft-gradient">
        <div className="flex items-start gap-3">
          <Printer className="mt-0.5 size-5 shrink-0 text-sky" aria-hidden />
          <div>
            <h3 className="text-base font-bold text-navy">Tip</h3>
            <p className="mt-1 text-sm text-charcoal">
              Print double-sided if you can. If you cannot print, email{' '}
              <a
                href={`mailto:${formsContent.contactEmail}`}
                className="font-semibold text-sky hover:text-sky-700"
              >
                {formsContent.contactEmail}
              </a>{' '}
              and Skyline will post a copy.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
