import { format, parseISO } from 'date-fns';
import { enGB } from 'date-fns/locale';

export function formatDate(isoOrDate: string | Date, pattern = 'dd/MM/yyyy'): string {
  const date = typeof isoOrDate === 'string' ? parseISO(isoOrDate) : isoOrDate;
  return format(date, pattern, { locale: enGB });
}

export function formatLongDate(isoOrDate: string | Date): string {
  return formatDate(isoOrDate, 'EEEE d MMMM yyyy');
}

export function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function daysUntil(isoDate: string): number {
  const target = parseISO(isoDate);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
