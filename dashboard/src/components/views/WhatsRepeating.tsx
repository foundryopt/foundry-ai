'use client';

import type { RepeatBreach, OwnerLoad } from '@/lib/types';
import { DataTable } from '@/components/tables/DataTable';
import { CategoryTag } from '@/components/ui/CategoryTag';
import { Badge } from '@/components/ui/Badge';
import { URGENCY_COLORS } from '@/lib/constants';

interface WhatsRepeatingProps {
  repeatBreaches: RepeatBreach[];
  ownerLoads: OwnerLoad[];
  invoicePatterns: { vendor: string; invoiceCount: number; issueCount: number; commonIssue: string; avgResolutionDays: number }[];
}

export function WhatsRepeating({ repeatBreaches, ownerLoads, invoicePatterns }: WhatsRepeatingProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Repeat SLA Breaches */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Repeat SLA Breaches</h2>
        <DataTable
          data={repeatBreaches}
          keyFn={(r) => `${r.category}-${r.owner}`}
          columns={[
            {
              key: 'category',
              header: 'Category',
              render: (r) => <CategoryTag category={r.category} />,
            },
            {
              key: 'owner',
              header: 'Owner',
              render: (r) => r.owner,
              sortValue: (r) => r.owner,
            },
            {
              key: 'count',
              header: 'Count',
              render: (r) => (
                <span className="font-semibold">{r.count}</span>
              ),
              sortValue: (r) => r.count,
            },
            {
              key: 'avgDays',
              header: 'Avg Days Over',
              render: (r) =>
                r.avgDaysOverdue > 0 ? (
                  <span className="text-red-600 font-medium">{r.avgDaysOverdue}d</span>
                ) : (
                  <span className="text-gray-400">—</span>
                ),
              sortValue: (r) => r.avgDaysOverdue,
            },
            {
              key: 'pattern',
              header: 'Pattern',
              render: (r) => <span className="text-gray-500">{r.pattern}</span>,
              className: 'max-w-[300px]',
            },
          ]}
        />
      </section>

      {/* Owner Load */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Owner Load</h2>
        <DataTable
          data={ownerLoads}
          keyFn={(r) => r.owner}
          columns={[
            {
              key: 'owner',
              header: 'Owner',
              render: (r) => (
                <div>
                  <span className="font-medium">{r.owner}</span>
                  <span className="text-gray-400 ml-1">({r.role})</span>
                </div>
              ),
              sortValue: (r) => r.owner,
            },
            {
              key: 'total',
              header: 'Total',
              render: (r) => <span className="font-semibold">{r.total}</span>,
              sortValue: (r) => r.total,
            },
            {
              key: 'overdue',
              header: 'Overdue',
              render: (r) =>
                r.overdue > 0 ? (
                  <Badge className={`${URGENCY_COLORS.overdue.bg} ${URGENCY_COLORS.overdue.text}`}>
                    {r.overdue}
                  </Badge>
                ) : (
                  <span className="text-gray-300">0</span>
                ),
              sortValue: (r) => r.overdue,
            },
            {
              key: 'dueToday',
              header: 'Due Today',
              render: (r) =>
                r.dueToday > 0 ? (
                  <Badge className={`${URGENCY_COLORS['due-today'].bg} ${URGENCY_COLORS['due-today'].text}`}>
                    {r.dueToday}
                  </Badge>
                ) : (
                  <span className="text-gray-300">0</span>
                ),
              sortValue: (r) => r.dueToday,
            },
            {
              key: 'new',
              header: 'New',
              render: (r) =>
                r.newItems > 0 ? (
                  <Badge className={`${URGENCY_COLORS.new.bg} ${URGENCY_COLORS.new.text}`}>
                    {r.newItems}
                  </Badge>
                ) : (
                  <span className="text-gray-300">0</span>
                ),
              sortValue: (r) => r.newItems,
            },
            {
              key: 'watching',
              header: 'Watching',
              render: (r) =>
                r.watching > 0 ? (
                  <span className="text-gray-500">{r.watching}</span>
                ) : (
                  <span className="text-gray-300">0</span>
                ),
              sortValue: (r) => r.watching,
            },
          ]}
        />
      </section>

      {/* Invoice Gate Patterns */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Invoice Gate Patterns</h2>
        <DataTable
          data={invoicePatterns}
          keyFn={(r) => r.vendor}
          columns={[
            {
              key: 'vendor',
              header: 'Vendor',
              render: (r) => <span className="font-medium">{r.vendor}</span>,
              sortValue: (r) => r.vendor,
            },
            {
              key: 'invoices',
              header: 'Invoices',
              render: (r) => r.invoiceCount,
              sortValue: (r) => r.invoiceCount,
            },
            {
              key: 'issues',
              header: 'Issues',
              render: (r) =>
                r.issueCount > 0 ? (
                  <span className="text-red-600 font-medium">{r.issueCount}</span>
                ) : (
                  <span className="text-green-600">0</span>
                ),
              sortValue: (r) => r.issueCount,
            },
            {
              key: 'commonIssue',
              header: 'Common Issue',
              render: (r) => <span className="text-gray-500">{r.commonIssue}</span>,
              className: 'max-w-[250px]',
            },
            {
              key: 'resolution',
              header: 'Avg Resolution',
              render: (r) =>
                r.avgResolutionDays > 0 ? `${r.avgResolutionDays}d` : '—',
              sortValue: (r) => r.avgResolutionDays,
            },
          ]}
        />
      </section>
    </div>
  );
}
