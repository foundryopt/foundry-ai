'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { RepeatBreach, OwnerLoad, InvoicePattern, TimesheetSummary, TimesheetCostCode, TimesheetRole } from '@/lib/types';
import { DataTable } from '@/components/tables/DataTable';
import { CategoryTag } from '@/components/ui/CategoryTag';
import { Badge } from '@/components/ui/Badge';
import { URGENCY_COLORS } from '@/lib/constants';

interface WhatsRepeatingProps {
  repeatBreaches: RepeatBreach[];
  ownerLoads: OwnerLoad[];
  invoicePatterns: InvoicePattern[];
  timesheet: TimesheetSummary;
}

/* ── Inline icons ── */

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

/* ── Helpers ── */

const ROLE_ORDER: TimesheetRole[] = ['PM', 'Super', 'Designer', 'Procurement', 'General Labor', 'Ops'];

function fmtHrs(n: number): string {
  return n.toLocaleString() + 'h';
}

function pctColor(pct: number): string {
  if (pct >= 95) return 'text-red-600';
  if (pct >= 80) return 'text-amber-600';
  return 'text-green-600';
}

function pctBg(pct: number): string {
  if (pct >= 95) return 'bg-red-500';
  if (pct >= 80) return 'bg-amber-500';
  return 'bg-green-500';
}

/* ── Timesheet Section ── */

function TimesheetTracker({ timesheet }: { timesheet: TimesheetSummary }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showReport, setShowReport] = useState(false);

  function toggleRow(costCode: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(costCode)) next.delete(costCode);
      else next.add(costCode);
      return next;
    });
  }

  const overspendItems = timesheet.costCodes.filter((c) => c.overspend);
  const coItems = timesheet.costCodes.filter((c) => c.coRecommendation);
  const highUsageItems = timesheet.costCodes.filter((c) => c.percentUsed >= 80 && !c.overspend);

  // Aggregate hours by role across all cost codes
  const roleTotals = new Map<TimesheetRole, { budgeted: number; spent: number; remaining: number; co: number; pco: number }>();
  for (const role of ROLE_ORDER) {
    roleTotals.set(role, { budgeted: 0, spent: 0, remaining: 0, co: 0, pco: 0 });
  }
  for (const cc of timesheet.costCodes) {
    for (const rb of cc.roleBreakdown) {
      const t = roleTotals.get(rb.role);
      if (t) {
        t.budgeted += rb.budgeted;
        t.spent += rb.spent;
        t.remaining += rb.remaining;
        t.co += rb.coHours;
        t.pco += rb.pcoHours;
      }
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Timesheet Tracker</h2>
        <button
          onClick={() => setShowReport(!showReport)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded border border-blue-200 hover:border-blue-300 transition-colors"
        >
          {showReport ? 'Hide Report' : 'View Report'}
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        <SummaryCard label="Budgeted" value={fmtHrs(timesheet.totalBudgetedHours)} color="text-gray-900" />
        <SummaryCard label="Spent" value={fmtHrs(timesheet.totalSpentHours)} sub={`${timesheet.percentUsed}%`} color="text-blue-700" />
        <SummaryCard label="Remaining" value={fmtHrs(timesheet.totalRemainingHours)} color="text-gray-700" />
        <SummaryCard label="CO Hours" value={fmtHrs(timesheet.totalCOHours)} color="text-orange-600" />
        <SummaryCard label="PCO Hours" value={fmtHrs(timesheet.totalPCOHours)} color="text-amber-600" />
        <SummaryCard
          label="Overspend"
          value={`${timesheet.overspendCount} items`}
          color={timesheet.overspendCount > 0 ? 'text-red-600' : 'text-green-600'}
        />
      </div>

      {/* ── Overspend Alerts ── */}
      {overspendItems.length > 0 && (
        <div className="mb-6 space-y-2">
          {overspendItems.map((item) => (
            <div key={item.costCode} className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-red-500 text-sm mt-0.5">!</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-red-800">
                    {item.costCode} — {item.description}
                    <span className="ml-2 text-xs font-normal text-red-600">({item.percentUsed}% used)</span>
                  </p>
                  {item.coRecommendation && (
                    <p className="text-xs text-red-700 mt-1">
                      <span className="font-medium">CO → {item.coRecommendation.recipient}:</span>{' '}
                      {item.coRecommendation.reason}
                      <span className="ml-1 font-semibold">({fmtHrs(item.coRecommendation.estimatedHours)} est.)</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Hours Table by Cost Code ── */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm mb-6">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <th className="px-3 py-2 min-w-[200px]">Cost Code / Role</th>
              <th className="px-3 py-2 w-20">Job</th>
              <th className="px-3 py-2 w-24 text-right">Budgeted</th>
              <th className="px-3 py-2 w-24 text-right">Spent</th>
              <th className="px-3 py-2 w-24 text-right">Remaining</th>
              <th className="px-3 py-2 w-20 text-right">CO Hrs</th>
              <th className="px-3 py-2 w-20 text-right">PCO Hrs</th>
              <th className="px-3 py-2 w-28 text-right">% Used</th>
              <th className="px-3 py-2 w-16 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {timesheet.costCodes.map((cc) => {
              const isExp = expanded.has(cc.costCode);
              return (
                <TimesheetRow key={cc.costCode} item={cc} isExpanded={isExp} onToggle={() => toggleRow(cc.costCode)} />
              );
            })}
          </tbody>
          {/* Grand total */}
          <tfoot>
            <tr className="bg-gray-100 border-t-2 border-gray-300 text-sm font-bold">
              <td className="px-3 py-2 text-gray-900">Total</td>
              <td className="px-3 py-2" />
              <td className="px-3 py-2 text-right tabular-nums">{fmtHrs(timesheet.totalBudgetedHours)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{fmtHrs(timesheet.totalSpentHours)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{fmtHrs(timesheet.totalRemainingHours)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{fmtHrs(timesheet.totalCOHours)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{fmtHrs(timesheet.totalPCOHours)}</td>
              <td className="px-3 py-2 text-right tabular-nums">
                <span className={pctColor(timesheet.percentUsed)}>{timesheet.percentUsed}%</span>
              </td>
              <td className="px-3 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Report Summary ── */}
      {showReport && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5">
          <h3 className="text-base font-semibold text-gray-900">Hours Report Summary</h3>

          {/* Role Summary Table */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Hours by Role</h4>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                    <th className="px-3 py-2 text-left">Role</th>
                    <th className="px-3 py-2 text-right">Budgeted</th>
                    <th className="px-3 py-2 text-right">Spent</th>
                    <th className="px-3 py-2 text-right">Remaining</th>
                    <th className="px-3 py-2 text-right">CO</th>
                    <th className="px-3 py-2 text-right">PCO</th>
                    <th className="px-3 py-2 text-right">% Used</th>
                  </tr>
                </thead>
                <tbody>
                  {ROLE_ORDER.map((role) => {
                    const t = roleTotals.get(role)!;
                    if (t.budgeted === 0 && t.spent === 0) return null;
                    const pct = t.budgeted > 0 ? Math.round((t.spent / t.budgeted) * 100) : 0;
                    return (
                      <tr key={role} className="border-b border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-800">{role}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-600">{fmtHrs(t.budgeted)}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-700">{fmtHrs(t.spent)}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-600">{fmtHrs(t.remaining)}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-orange-600">{t.co > 0 ? fmtHrs(t.co) : '—'}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-amber-600">{t.pco > 0 ? fmtHrs(t.pco) : '—'}</td>
                        <td className={clsx('px-3 py-2 text-right tabular-nums font-medium', pctColor(pct))}>{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overspend */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-red-800 uppercase mb-2">Overspend Items ({overspendItems.length})</h4>
              {overspendItems.length === 0 ? (
                <p className="text-xs text-red-600">None — all cost codes within budget.</p>
              ) : (
                <ul className="space-y-1">
                  {overspendItems.map((i) => (
                    <li key={i.costCode} className="text-xs text-red-700">
                      <span className="font-medium">{i.costCode}</span> — {i.percentUsed}% used
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* High Usage */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-amber-800 uppercase mb-2">High Usage ({highUsageItems.length})</h4>
              {highUsageItems.length === 0 ? (
                <p className="text-xs text-amber-600">None above 80% threshold.</p>
              ) : (
                <ul className="space-y-1">
                  {highUsageItems.map((i) => (
                    <li key={i.costCode} className="text-xs text-amber-700">
                      <span className="font-medium">{i.costCode}</span> — {i.percentUsed}% used
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* CO Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-blue-800 uppercase mb-2">CO Recommendations ({coItems.length})</h4>
              {coItems.length === 0 ? (
                <p className="text-xs text-blue-600">No CO actions needed.</p>
              ) : (
                <ul className="space-y-1.5">
                  {coItems.map((i) => (
                    <li key={i.costCode} className="text-xs text-blue-700">
                      <span className="font-medium">{i.costCode}</span>
                      {' → '}
                      <span className="font-semibold">{i.coRecommendation!.recipient}</span>
                      {' — '}
                      {fmtHrs(i.coRecommendation!.estimatedHours)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
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

/* ── Timesheet Row (cost code + role breakdown) ── */

function TimesheetRow({ item, isExpanded, onToggle }: { item: TimesheetCostCode; isExpanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr
        className={clsx(
          'border-b border-gray-200 font-medium cursor-pointer hover:bg-gray-50 select-none',
          item.overspend && 'bg-red-50/50',
        )}
        onClick={onToggle}
      >
        <td className="px-3 py-2">
          <span className="inline-flex items-center gap-1">
            {isExpanded ? <ChevronDown className="text-gray-400 shrink-0" /> : <ChevronRight className="text-gray-400 shrink-0" />}
            <span className="text-gray-500">{item.costCode}</span>
            <span className="ml-1 text-gray-800">{item.description}</span>
          </span>
        </td>
        <td className="px-3 py-2 text-xs text-gray-500">{item.jobName}</td>
        <td className="px-3 py-2 text-right tabular-nums">{fmtHrs(item.totalBudgeted)}</td>
        <td className="px-3 py-2 text-right tabular-nums text-gray-700">{fmtHrs(item.totalSpent)}</td>
        <td className="px-3 py-2 text-right tabular-nums text-gray-600">{fmtHrs(item.totalRemaining)}</td>
        <td className="px-3 py-2 text-right tabular-nums text-orange-600">{item.totalCO > 0 ? fmtHrs(item.totalCO) : '—'}</td>
        <td className="px-3 py-2 text-right tabular-nums text-amber-600">{item.totalPCO > 0 ? fmtHrs(item.totalPCO) : '—'}</td>
        <td className="px-3 py-2 text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={clsx('h-full rounded-full', pctBg(item.percentUsed))}
                style={{ width: `${Math.min(100, item.percentUsed)}%` }}
              />
            </div>
            <span className={clsx('tabular-nums text-xs font-medium', pctColor(item.percentUsed))}>
              {item.percentUsed}%
            </span>
          </div>
        </td>
        <td className="px-3 py-2 text-center">
          {item.overspend ? (
            <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full" title="Overspend" />
          ) : item.percentUsed >= 80 ? (
            <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-full" title="High usage" />
          ) : (
            <span className="inline-block w-2.5 h-2.5 bg-green-400 rounded-full" title="On track" />
          )}
        </td>
      </tr>
      {/* Role breakdown rows */}
      {isExpanded && item.roleBreakdown.map((rb) => {
        const rbPct = rb.budgeted > 0 ? Math.round((rb.spent / rb.budgeted) * 100) : 0;
        const rbOver = rb.spent > rb.budgeted;
        return (
          <tr key={`${item.costCode}-${rb.role}`} className="border-b border-gray-100 text-xs bg-gray-50/50">
            <td className="px-3 py-1.5 pl-10 text-gray-600">{rb.role}</td>
            <td className="px-3 py-1.5" />
            <td className="px-3 py-1.5 text-right tabular-nums text-gray-500">{fmtHrs(rb.budgeted)}</td>
            <td className={clsx('px-3 py-1.5 text-right tabular-nums', rbOver ? 'text-red-600 font-medium' : 'text-gray-600')}>
              {fmtHrs(rb.spent)}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums text-gray-500">
              {rb.remaining > 0 ? fmtHrs(rb.remaining) : rbOver ? <span className="text-red-500">-{fmtHrs(rb.spent - rb.budgeted)}</span> : '0h'}
            </td>
            <td className="px-3 py-1.5 text-right tabular-nums text-orange-500">{rb.coHours > 0 ? fmtHrs(rb.coHours) : '—'}</td>
            <td className="px-3 py-1.5 text-right tabular-nums text-amber-500">{rb.pcoHours > 0 ? fmtHrs(rb.pcoHours) : '—'}</td>
            <td className="px-3 py-1.5 text-right">
              <span className={clsx('tabular-nums text-xs', pctColor(rbPct))}>{rbPct}%</span>
            </td>
            <td className="px-3 py-1.5" />
          </tr>
        );
      })}
      {/* CO recommendation row */}
      {isExpanded && item.coRecommendation && (
        <tr className="border-b border-gray-200 bg-blue-50/50">
          <td colSpan={9} className="px-3 py-2 pl-10">
            <div className="flex items-start gap-2 text-xs">
              <span className="shrink-0 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold text-[10px]">
                CO → {item.coRecommendation.recipient}
              </span>
              <span className="text-gray-600">{item.coRecommendation.reason}</span>
              <span className="shrink-0 font-semibold text-blue-700">{fmtHrs(item.coRecommendation.estimatedHours)} est.</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Main Component ── */

export function WhatsRepeating({ repeatBreaches, ownerLoads, invoicePatterns, timesheet }: WhatsRepeatingProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* ── Timesheet Tracker (new — top of view) ── */}
      <TimesheetTracker timesheet={timesheet} />

      {/* ── Repeat SLA Breaches ── */}
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

      {/* ── Owner Load ── */}
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

      {/* ── Invoice Gate Patterns ── */}
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
