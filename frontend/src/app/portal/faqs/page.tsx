'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/portal/PageHeader';
import { faqCategories } from '@/content/faqs';

function answerText(answer: unknown): string {
  if (typeof answer === 'string') return answer;
  if (Array.isArray(answer)) return answer.map((a) => answerText(a)).join(' ');
  return '';
}

export default function FaqsPage() {
  const [query, setQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return faqCategories;
    const q = query.toLowerCase();
    return faqCategories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.question.toLowerCase().includes(q) ||
            answerText(item.answer).toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [query]);

  const totalMatches = filteredCategories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Help"
        title="Frequently asked questions"
        description="Most questions can be answered here. If you cannot find what you need, the Skyline office is happy to help."
      />

      <Card className="bg-soft-gradient">
        <label htmlFor="faq-search" className="block text-sm font-semibold text-navy">
          Search the FAQs
        </label>
        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-charcoal-300"
            aria-hidden
          />
          <Input
            id="faq-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try 'weight limit' or 'fundraising'…"
            className="pl-10"
          />
        </div>
        {query && (
          <p className="mt-3 text-sm text-charcoal-400">
            {totalMatches === 0
              ? 'No matches. Try a shorter or different keyword.'
              : `${totalMatches} ${totalMatches === 1 ? 'match' : 'matches'} found.`}
          </p>
        )}
      </Card>

      <div className="space-y-6">
        {filteredCategories.map((category) => (
          <Card key={category.id}>
            <header className="mb-2 flex items-center gap-3">
              <h2 className="text-xl font-bold text-navy">{category.title}</h2>
              <Badge tone="sky">{category.items.length}</Badge>
            </header>
            {/* type=multiple allows opening more than one at a time. All start closed. */}
            <Accordion type="multiple">
              {category.items.map((item, i) => (
                <AccordionItem key={i} value={`${category.id}-${i}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>
                    {typeof item.answer === 'string' ? (
                      item.answer.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className={idx > 0 ? 'mt-3' : undefined}>
                          {paragraph}
                        </p>
                      ))
                    ) : (
                      item.answer
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        ))}
      </div>
    </div>
  );
}
