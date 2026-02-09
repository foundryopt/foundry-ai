import { differenceInCalendarDays, format, formatDistanceToNowStrict } from 'date-fns';
import type { Urgency } from './types';

/** Calculate urgency from SLA date relative to today */
export function calcUrgency(slaDate: string, createdDate: string): Urgency {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sla = new Date(slaDate);
  sla.setHours(0, 0, 0, 0);
  const created = new Date(createdDate);
  created.setHours(0, 0, 0, 0);

  const daysUntilSla = differenceInCalendarDays(sla, today);
  const daysSinceCreated = differenceInCalendarDays(today, created);

  if (daysUntilSla < 0) return 'overdue';
  if (daysUntilSla === 0) return 'due-today';
  if (daysSinceCreated <= 2) return 'new';
  return 'watching';
}

/** Format days overdue/until due as human string */
export function formatUrgencyLabel(urgency: Urgency, daysOverdue?: number, daysUntilDue?: number): string {
  switch (urgency) {
    case 'overdue':
      return daysOverdue ? `${daysOverdue}d overdue` : 'Overdue';
    case 'due-today':
      return 'Due today';
    case 'new':
      return 'New';
    case 'watching':
      return daysUntilDue ? `${daysUntilDue}d remaining` : 'Watching';
  }
}

/** Format a date as "Feb 8, 2026" */
export function formatDate(iso: string): string {
  return format(new Date(iso), 'MMM d, yyyy');
}

/** Format a date as relative: "5 days ago" */
export function formatRelative(iso: string): string {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
}

/** Format currency */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format percentage */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
