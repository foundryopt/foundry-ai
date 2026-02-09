import type { RepeatBreach, OwnerLoad } from '@/lib/types';

export const REPEAT_BREACHES: RepeatBreach[] = [
  {
    category: 'RFI',
    owner: 'Taylor R.',
    count: 3,
    avgDaysOverdue: 4,
    pattern: 'Architectural/MEP RFIs consistently late — design coordination gap',
  },
  {
    category: 'Submittal',
    owner: 'Taylor R.',
    count: 2,
    avgDaysOverdue: 6,
    pattern: 'Submittal reviews delayed — vendor late submissions + review queue',
  },
  {
    category: 'Invoice',
    owner: 'Jordan M.',
    count: 2,
    avgDaysOverdue: 0,
    pattern: 'Invoices arriving without proper backup documentation',
  },
  {
    category: 'Decision',
    owner: 'Rachel K.',
    count: 1,
    avgDaysOverdue: 4,
    pattern: 'Material decisions delayed — owner preference review time',
  },
];

export const OWNER_LOADS: OwnerLoad[] = [
  {
    owner: 'Jordan M.',
    role: 'PM',
    total: 6,
    overdue: 1,
    dueToday: 2,
    newItems: 1,
    watching: 2,
  },
  {
    owner: 'Taylor R.',
    role: 'Ops',
    total: 5,
    overdue: 3,
    dueToday: 0,
    newItems: 2,
    watching: 0,
  },
  {
    owner: 'Alex P.',
    role: 'Procurement',
    total: 3,
    overdue: 1,
    dueToday: 0,
    newItems: 0,
    watching: 2,
  },
  {
    owner: 'Mike S.',
    role: 'Super',
    total: 1,
    overdue: 0,
    dueToday: 0,
    newItems: 1,
    watching: 0,
  },
  {
    owner: 'Rachel K.',
    role: "Owner's Rep",
    total: 1,
    overdue: 1,
    dueToday: 0,
    newItems: 0,
    watching: 0,
  },
  {
    owner: 'Sam W.',
    role: 'Principal',
    total: 1,
    overdue: 0,
    dueToday: 0,
    newItems: 1,
    watching: 0,
  },
];

export const INVOICE_PATTERNS = [
  {
    vendor: 'Spark Electric',
    invoiceCount: 5,
    issueCount: 2,
    commonIssue: 'Exceeds approved SOV line items',
    avgResolutionDays: 3,
  },
  {
    vendor: 'Crown Mechanical',
    invoiceCount: 4,
    issueCount: 2,
    commonIssue: 'Missing job numbers and CO references',
    avgResolutionDays: 5,
  },
  {
    vendor: 'ABC Concrete',
    invoiceCount: 8,
    issueCount: 0,
    commonIssue: '—',
    avgResolutionDays: 0,
  },
];
