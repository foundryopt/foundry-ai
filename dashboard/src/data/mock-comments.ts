import type { BudgetComment } from '@/lib/types';

export const SEED_COMMENTS: BudgetComment[] = [
  {
    id: 'cmt-001',
    lineItemId: 'SB-23-01',
    author: 'Jordan M.',
    timestamp: '2026-02-07T14:30:00Z',
    text: 'Ductwork CO approved — added scope for exhaust reroute at L3.',
    source: 'dashboard',
  },
  {
    id: 'cmt-002',
    lineItemId: 'SB-23-01',
    author: 'Mike S.',
    timestamp: '2026-02-07T15:12:00Z',
    text: 'Field confirmed — reroute complete, ready for insulation.',
    source: 'slack',
  },
  {
    id: 'cmt-003',
    lineItemId: 'SB-26-01',
    author: 'Taylor R.',
    timestamp: '2026-02-06T09:45:00Z',
    text: 'Electrical rough-in 84% — panel schedule updated in Smartsheet.',
    source: 'dashboard',
  },
  {
    id: 'cmt-004',
    lineItemId: 'SB-09-02',
    author: 'Alex P.',
    timestamp: '2026-02-05T16:20:00Z',
    text: 'LVP material on site — install crew scheduled next Monday.',
    source: 'slack',
  },
  {
    id: 'cmt-005',
    lineItemId: 'SB-14-01',
    author: 'Jordan M.',
    timestamp: '2026-02-08T10:00:00Z',
    text: 'Elevator cab finishes submittal resubmitted — awaiting architect review.',
    source: 'dashboard',
  },
];
