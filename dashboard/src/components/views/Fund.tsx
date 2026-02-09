'use client';

import { useState, useMemo } from 'react';
import clsx from 'clsx';
import type { FundSummary, FundDraw } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface FundProps {
  fund: FundSummary;
  isAllProjects: boolean;
}

/* ── Summary Card ── */

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{label}</p>
      <p className={clsx('text-lg font-bold tabular-nums', color)}>{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

/* ── Main Component ── */

export function Fund({ fund, isAllProjects }: FundProps) {
  const percentDrawn = fund.totalCommitment > 0
    ? Math.round((fund.totalDrawn / fund.totalCommitment) * 100)
    : 0;

  // Sort draws by draw number ascending
  const sortedDraws = useMemo(() => {
    return [...fund.draws].sort((a, b) => a.drawNumber - b.drawNumber);
  }, [fund.draws]);

  // Status badge colors
  const getStatusBadge = (status: FundDraw['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'submitted':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* ── Summary Section ── */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Fund Summary</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <SummaryCard
            label="Total Commitment"
            value={formatCurrency(fund.totalCommitment)}
            color="text-gray-900"
          />
          <SummaryCard
            label="Total Drawn"
            value={formatCurrency(fund.totalDrawn)}
            color="text-blue-700"
          />
          <SummaryCard
            label="Total Remaining"
            value={formatCurrency(fund.totalRemaining)}
            color="text-gray-700"
          />
          <SummaryCard
            label="% Drawn"
            value={`${percentDrawn}%`}
            color={percentDrawn >= 90 ? 'text-red-600' : percentDrawn >= 70 ? 'text-amber-600' : 'text-green-600'}
          />
        </div>

        {/* Visual Progress Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 uppercase">Draw Progress</span>
            <span className="text-xs font-medium text-gray-500">{percentDrawn}% Complete</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-6 bg-gray-200 rounded-lg overflow-hidden mb-2">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${Math.min(100, percentDrawn)}%` }}
            />
          </div>

          {/* Amounts under bar */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-gray-600">
                Drawn: <span className="font-semibold text-gray-900">{formatCurrency(fund.totalDrawn)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded" />
              <span className="text-gray-600">
                Remaining: <span className="font-semibold text-gray-900">{formatCurrency(fund.totalRemaining)}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Draw Schedule Table ── */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Draw Schedule</h2>

        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <th className="px-3 py-2 w-20">Draw #</th>
                <th className="px-3 py-2 w-32">Date</th>
                <th className="px-3 py-2 w-32 text-right">Amount</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2 w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedDraws.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-gray-400">
                    No draws recorded
                  </td>
                </tr>
              ) : (
                sortedDraws.map((draw) => (
                  <tr key={draw.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-3 py-3">
                      <span className="font-semibold text-gray-900">#{draw.drawNumber}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {formatDate(draw.date)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(draw.amount)}
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {draw.description}
                    </td>
                    <td className="px-3 py-3">
                      <span className={clsx(
                        'inline-block px-2 py-1 rounded text-xs font-medium capitalize',
                        getStatusBadge(draw.status)
                      )}>
                        {draw.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {sortedDraws.length > 0 && (
              <tfoot>
                <tr className="bg-gray-100 border-t-2 border-gray-300 text-sm font-bold">
                  <td className="px-3 py-2" colSpan={2}>Total Drawn</td>
                  <td className="px-3 py-2 text-right tabular-nums text-gray-900">
                    {formatCurrency(fund.totalDrawn)}
                  </td>
                  <td className="px-3 py-2" colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
}
