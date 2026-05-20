'use client';

import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '@/lib/cn';

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = forwardRef<
  ElementRef<typeof AccordionPrimitive.Item>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...rest }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b border-navy/10 last:border-b-0', className)}
    {...rest}
  />
));
AccordionItem.displayName = 'AccordionItem';

export const AccordionTrigger = forwardRef<
  ElementRef<typeof AccordionPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...rest }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'group flex flex-1 items-center justify-between gap-3 py-4 text-left text-base font-semibold text-navy',
        'transition-all hover:text-sky-700',
        'focus-visible:outline-none focus-visible:text-sky-700',
        className,
      )}
      {...rest}
    >
      {children}
      <ChevronDown
        className="size-5 shrink-0 text-charcoal-300 transition-transform duration-300 group-data-[state=open]:rotate-180 group-data-[state=open]:text-sky"
        aria-hidden
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = 'AccordionTrigger';

export const AccordionContent = forwardRef<
  ElementRef<typeof AccordionPrimitive.Content>,
  ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...rest }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden text-charcoal data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
    )}
    {...rest}
  >
    <div className={cn('pb-4 pr-8 leading-relaxed', className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = 'AccordionContent';
