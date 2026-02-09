'use client';

import type { OpenTask } from '@/lib/types';
import { DataTable } from '@/components/tables/DataTable';
import { CategoryTag } from '@/components/ui/CategoryTag';
import { formatDate } from '@/lib/utils';
import type { LeadTimeDetail, SubmittalDetail, InvoiceDetail } from '@/lib/types';

interface ProcurementDeliveryProps {
  tasks: OpenTask[];
}

export function ProcurementDelivery({ tasks }: ProcurementDeliveryProps) {
  const leadTimes = tasks.filter((t) => t.category === 'Lead Time');
  const submittals = tasks.filter((t) => t.category === 'Submittal');
  const invoices = tasks.filter((t) => t.category === 'Invoice');

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Lead-Time Risks */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Lead-Time Risks</h2>
        <DataTable
          data={leadTimes}
          keyFn={(t) => t.id}
          columns={[
            {
              key: 'id',
              header: 'ID',
              render: (t) => <span className="font-mono">{t.id}</span>,
            },
            {
              key: 'item',
              header: 'Item',
              render: (t) => {
                const d = t.detail as LeadTimeDetail;
                return <span className="font-medium">{d.itemDescription}</span>;
              },
              className: 'max-w-[250px]',
            },
            {
              key: 'vendor',
              header: 'Vendor',
              render: (t) => (t.detail as LeadTimeDetail).vendor,
            },
            {
              key: 'delivery',
              header: 'Expected',
              render: (t) => formatDate((t.detail as LeadTimeDetail).expectedDelivery),
            },
            {
              key: 'required',
              header: 'Required',
              render: (t) => formatDate((t.detail as LeadTimeDetail).requiredOnSite),
            },
            {
              key: 'float',
              header: 'Float',
              render: (t) => {
                const d = t.detail as LeadTimeDetail;
                return (
                  <span
                    className={
                      d.floatDays < 0
                        ? 'text-red-600 font-semibold'
                        : d.floatDays < 7
                          ? 'text-yellow-600 font-medium'
                          : 'text-green-600'
                    }
                  >
                    {d.floatDays}d
                  </span>
                );
              },
              sortValue: (t) => (t.detail as LeadTimeDetail).floatDays,
            },
            {
              key: 'risk',
              header: 'Risk',
              render: (t) => {
                const d = t.detail as LeadTimeDetail;
                const colors =
                  d.riskLevel === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : d.riskLevel === 'at-risk'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700';
                return (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${colors}`}>
                    {d.riskLevel}
                  </span>
                );
              },
            },
          ]}
        />
      </section>

      {/* Submittal Pipeline */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Submittal Pipeline</h2>
        <DataTable
          data={submittals}
          keyFn={(t) => t.id}
          columns={[
            {
              key: 'id',
              header: 'ID',
              render: (t) => <span className="font-mono">{t.id}</span>,
            },
            {
              key: 'subject',
              header: 'Subject',
              render: (t) => <span className="font-medium">{t.subject}</span>,
              className: 'max-w-[250px]',
            },
            {
              key: 'spec',
              header: 'Spec Section',
              render: (t) => (t.detail as SubmittalDetail).specSection,
            },
            {
              key: 'vendor',
              header: 'Vendor',
              render: (t) => (t.detail as SubmittalDetail).vendor,
            },
            {
              key: 'deadline',
              header: 'Review Deadline',
              render: (t) => formatDate((t.detail as SubmittalDetail).reviewDeadline),
            },
            {
              key: 'rev',
              header: 'Rev',
              render: (t) => `Rev ${(t.detail as SubmittalDetail).revisionNumber}`,
            },
            {
              key: 'urgency',
              header: 'Status',
              render: (t) => <CategoryTag category={t.category} />,
            },
          ]}
        />
      </section>

      {/* Vendor Invoice Status */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Vendor Invoice Status</h2>
        <DataTable
          data={invoices}
          keyFn={(t) => t.id}
          columns={[
            {
              key: 'id',
              header: 'Invoice #',
              render: (t) => <span className="font-mono">{(t.detail as InvoiceDetail).invoiceNumber}</span>,
            },
            {
              key: 'vendor',
              header: 'Vendor',
              render: (t) => <span className="font-medium">{(t.detail as InvoiceDetail).vendor}</span>,
            },
            {
              key: 'amount',
              header: 'Amount',
              render: (t) =>
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
                  (t.detail as InvoiceDetail).amount,
                ),
              sortValue: (t) => (t.detail as InvoiceDetail).amount,
            },
            {
              key: 'costCode',
              header: 'Cost Code',
              render: (t) => (t.detail as InvoiceDetail).costCode,
            },
            {
              key: 'match',
              header: 'Match',
              render: (t) => {
                const status = (t.detail as InvoiceDetail).matchStatus;
                const colors =
                  status === 'matched'
                    ? 'text-green-600'
                    : status === 'partial'
                      ? 'text-yellow-600'
                      : 'text-red-600';
                return <span className={`font-medium ${colors}`}>{status}</span>;
              },
            },
            {
              key: 'issue',
              header: 'Issue',
              render: (t) => (
                <span className="text-gray-500">{(t.detail as InvoiceDetail).issue}</span>
              ),
              className: 'max-w-[250px]',
            },
          ]}
        />
      </section>
    </div>
  );
}
