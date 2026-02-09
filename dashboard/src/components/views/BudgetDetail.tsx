'use client';

import { useMemo, useState, useCallback } from 'react';
import clsx from 'clsx';
import dynamic from 'next/dynamic';
import type { BudgetSummary, BudgetCategory, BudgetLineItem, BudgetComment } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { CostDrillDown } from '@/components/charts/CostDrillDown';
import { AttachmentPopover } from '@/components/ui/AttachmentPopover';
import { CommentThread } from '@/components/ui/CommentThread';
import { VendorComparison } from '@/components/charts/VendorComparison';
import { BidTimeline } from '@/components/charts/BidTimeline';
import { SEED_COMMENTS, VENDOR_BIDS, BID_MILESTONES } from '@/data';

const CostChart = dynamic(
  () => import('@/components/charts/CostChart').then((m) => m.CostChart),
  { ssr: false },
);

interface BudgetDetailProps {
  budget: BudgetSummary;
  isAllProjects: boolean;
}

/* ── Inline chevron icons ── */

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

/* ── Column definitions ── */

const COLUMNS = [
  { key: 'costCode', label: 'Cost Code', align: 'left' as const, width: 'w-24' },
  { key: 'description', label: 'Description', align: 'left' as const, width: 'min-w-[200px]' },
  { key: 'costType', label: 'Type', align: 'center' as const, width: 'w-14' },
  { key: 'unitPrice', label: 'Unit Price', align: 'right' as const, width: 'w-24' },
  { key: 'quantity', label: 'Qty', align: 'right' as const, width: 'w-16' },
  { key: 'unitType', label: 'Unit', align: 'center' as const, width: 'w-14' },
  { key: 'budget', label: 'Budget', align: 'right' as const, width: 'w-28' },
  { key: 'previousPaid', label: 'Prev Paid', align: 'right' as const, width: 'w-28' },
  { key: 'due', label: 'Due', align: 'right' as const, width: 'w-24' },
  { key: 'percentComplete', label: '% Comp', align: 'right' as const, width: 'w-18' },
  { key: 'remaining', label: 'Remaining', align: 'right' as const, width: 'w-28' },
  { key: 'co', label: 'CO', align: 'right' as const, width: 'w-24' },
  { key: 'pco', label: 'PCO', align: 'right' as const, width: 'w-24' },
  { key: 'actual', label: 'Actual', align: 'right' as const, width: 'w-28' },
] as const;

/* ── Helpers ── */

function sumLineItems(items: BudgetLineItem[], field: keyof BudgetLineItem): number {
  return items.reduce((sum, li) => sum + (li[field] as number), 0);
}

function avgPercent(items: BudgetLineItem[]): number {
  if (items.length === 0) return 0;
  const totalBudget = sumLineItems(items, 'budget');
  if (totalBudget === 0) return 0;
  const totalActual = sumLineItems(items, 'actual');
  return Math.round((totalActual / totalBudget) * 100);
}

interface GroupedByProject {
  projectId: string;
  projectName: string;
  categories: BudgetCategory[];
}

function groupByProject(categories: BudgetCategory[]): GroupedByProject[] {
  const map = new Map<string, GroupedByProject>();
  for (const cat of categories) {
    const pid = cat.projectId ?? 'unknown';
    const pname = cat.projectName ?? 'Unknown Project';
    if (!map.has(pid)) {
      map.set(pid, { projectId: pid, projectName: pname, categories: [] });
    }
    map.get(pid)!.categories.push(cat);
  }
  return Array.from(map.values());
}

/* ── Inline icons ── */

function PaperclipIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 7.5l-5.8 5.8a3 3 0 01-4.2-4.2l5.8-5.8a2 2 0 012.8 2.8L6.3 11.9a1 1 0 01-1.4-1.4L10.1 5" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h12a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V4a1 1 0 011-1z" />
    </svg>
  );
}

/* ── Component ── */

export function BudgetDetail({ budget, isAllProjects }: BudgetDetailProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);
  const [selectedCostCode, setSelectedCostCode] = useState<string | null>(null);
  const [commentOpenForItem, setCommentOpenForItem] = useState<string | null>(null);
  const [comments, setComments] = useState<BudgetComment[]>(SEED_COMMENTS);

  const projectGroups = useMemo(
    () => (isAllProjects ? groupByProject(budget.categories) : []),
    [budget.categories, isAllProjects],
  );

  const selectedCategory = selectedCostCode
    ? budget.categories.find((c) => c.costCode === selectedCostCode) ?? null
    : null;

  // Set of line item IDs that have comments
  const commentedItems = useMemo(() => {
    const set = new Set<string>();
    for (const c of comments) set.add(c.lineItemId);
    return set;
  }, [comments]);

  // Collect all expandable keys
  const allKeys = useMemo(() => {
    const keys: string[] = [];
    if (isAllProjects) {
      for (const pg of projectGroups) {
        keys.push(`proj:${pg.projectId}`);
        for (const cat of pg.categories) {
          keys.push(`cat:${pg.projectId}:${cat.costCode}`);
        }
      }
    } else {
      for (const cat of budget.categories) {
        keys.push(`cat:${cat.costCode}`);
      }
    }
    return keys;
  }, [budget.categories, isAllProjects, projectGroups]);

  function toggleKey(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    if (allExpanded) {
      setExpanded(new Set());
      setAllExpanded(false);
    } else {
      setExpanded(new Set(allKeys));
      setAllExpanded(true);
    }
  }

  const handleAddComment = useCallback((lineItemId: string, text: string, _sendToSlack: boolean) => {
    const newComment: BudgetComment = {
      id: `cmt-${Date.now()}`,
      lineItemId,
      author: 'You',
      timestamp: new Date().toISOString(),
      text,
      source: 'dashboard',
    };
    setComments((prev) => [...prev, newComment]);
    // TODO: If sendToSlack, post via webhook
  }, []);

  const showProjectCol = isAllProjects;
  const colCount = COLUMNS.length + (showProjectCol ? 1 : 0) + 2; // +2 for attachments & comments columns

  /* ── Grand total row from BudgetSummary ── */
  const allLineItems = budget.categories.flatMap((c) => c.lineItems ?? []);
  const grandTotalCO = sumLineItems(allLineItems, 'co');
  const grandTotalPCO = sumLineItems(allLineItems, 'pco');
  const grandTotalPrevPaid = sumLineItems(allLineItems, 'previousPaid');
  const grandTotalDue = sumLineItems(allLineItems, 'due');
  const grandTotalActual = sumLineItems(allLineItems, 'actual');

  /* ── Render helpers ── */

  function renderLineItemRow(li: BudgetLineItem, indent: number) {
    const pl = indent === 2 ? 'pl-12' : indent === 1 ? 'pl-8' : 'pl-4';
    const hasComments = commentedItems.has(li.id);
    const isCommentOpen = commentOpenForItem === li.id;

    return (
      <>
        <tr key={li.id} className="border-b border-gray-100 text-sm hover:bg-gray-50/50">
          {showProjectCol && <td className="px-3 py-2" />}
          <td className={clsx('px-3 py-2 text-gray-500', pl)}>{li.costCode}</td>
          <td className="px-3 py-2 text-gray-700">{li.description}</td>
          <td className="px-3 py-2 text-center text-gray-500">{li.costType}</td>
          <td className="px-3 py-2 text-right tabular-nums text-gray-600">{formatCurrency(li.unitPrice)}</td>
          <td className="px-3 py-2 text-right tabular-nums text-gray-600">{li.quantity.toLocaleString()}</td>
          <td className="px-3 py-2 text-center text-gray-500">{li.unitType}</td>
          <td className="px-3 py-2 text-right tabular-nums font-medium">{formatCurrency(li.budget)}</td>
          <td className="px-3 py-2 text-right tabular-nums text-gray-600">{formatCurrency(li.previousPaid)}</td>
          <td className="px-3 py-2 text-right tabular-nums text-gray-600">{formatCurrency(li.due)}</td>
          <td className="px-3 py-2 text-right tabular-nums text-gray-600">{formatPercent(li.percentComplete)}</td>
          <td className="px-3 py-2 text-right tabular-nums text-gray-600">{formatCurrency(li.remaining)}</td>
          <td className="px-3 py-2 text-right tabular-nums text-gray-600">{li.co ? formatCurrency(li.co) : '—'}</td>
          <td className="px-3 py-2 text-right tabular-nums text-gray-600">{li.pco ? formatCurrency(li.pco) : '—'}</td>
          <td className="px-3 py-2 text-right tabular-nums font-medium">{formatCurrency(li.actual)}</td>
          {/* Attachments column */}
          <td className="px-2 py-2 text-center">
            {li.attachments && li.attachments.length > 0 ? (
              <AttachmentPopover attachments={li.attachments} />
            ) : null}
          </td>
          {/* Comments column */}
          <td className="px-2 py-2 text-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCommentOpenForItem(isCommentOpen ? null : li.id);
              }}
              className={clsx(
                'relative p-0.5 transition-colors',
                isCommentOpen ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600',
              )}
              title="Comments"
            >
              <ChatIcon />
              {hasComments && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>
          </td>
        </tr>
        {/* Inline comment thread */}
        {isCommentOpen && (
          <tr key={`${li.id}-comments`}>
            <td colSpan={colCount} className="px-4 py-2">
              <CommentThread
                comments={comments}
                lineItemId={li.id}
                onAddComment={(text, sendToSlack) => handleAddComment(li.id, text, sendToSlack)}
                onClose={() => setCommentOpenForItem(null)}
              />
            </td>
          </tr>
        )}
      </>
    );
  }

  function renderCategoryRow(cat: BudgetCategory, expandKey: string, indent: number) {
    const isExp = expanded.has(expandKey);
    const items = cat.lineItems ?? [];
    const pl = indent === 1 ? 'pl-8' : 'pl-4';
    const catPct = items.length > 0 ? avgPercent(items) : (cat.spent / cat.current) * 100;
    const catCO = items.length > 0 ? sumLineItems(items, 'co') : 0;
    const catPCO = items.length > 0 ? sumLineItems(items, 'pco') : cat.potential;
    const catPrevPaid = items.length > 0 ? sumLineItems(items, 'previousPaid') : cat.spent;
    const catDue = items.length > 0 ? sumLineItems(items, 'due') : 0;
    const catActual = items.length > 0 ? sumLineItems(items, 'actual') : cat.spent;

    return (
      <>
        <tr
          key={expandKey}
          className={clsx(
            'border-b border-gray-200 text-sm font-medium bg-gray-50 cursor-pointer hover:bg-gray-100/70 select-none',
          )}
          onClick={() => toggleKey(expandKey)}
        >
          {showProjectCol && <td className="px-3 py-2" />}
          <td className={clsx('px-3 py-2', pl)}>
            <span className="inline-flex items-center gap-1">
              {isExp ? <ChevronDown className="text-gray-400 shrink-0" /> : <ChevronRight className="text-gray-400 shrink-0" />}
              {cat.costCode}
            </span>
          </td>
          <td className="px-3 py-2 font-semibold text-gray-800">{cat.label}</td>
          <td className="px-3 py-2" />
          <td className="px-3 py-2" />
          <td className="px-3 py-2" />
          <td className="px-3 py-2" />
          <td className="px-3 py-2 text-right tabular-nums font-semibold">{formatCurrency(cat.current)}</td>
          <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(catPrevPaid)}</td>
          <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(catDue)}</td>
          <td className="px-3 py-2 text-right tabular-nums">{formatPercent(catPct)}</td>
          <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(cat.remaining)}</td>
          <td className="px-3 py-2 text-right tabular-nums">{catCO ? formatCurrency(catCO) : '—'}</td>
          <td className="px-3 py-2 text-right tabular-nums">{catPCO ? formatCurrency(catPCO) : '—'}</td>
          <td className="px-3 py-2 text-right tabular-nums font-semibold">{formatCurrency(catActual)}</td>
          {/* Attachments column for category */}
          <td className="px-2 py-2 text-center">
            {cat.attachments && cat.attachments.length > 0 ? (
              <AttachmentPopover attachments={cat.attachments} />
            ) : null}
          </td>
          {/* Empty comments column for category row */}
          <td className="px-2 py-2" />
        </tr>
        {isExp && items.map((li) => renderLineItemRow(li, indent + 1))}
      </>
    );
  }

  function renderProjectGroup(pg: GroupedByProject) {
    const projKey = `proj:${pg.projectId}`;
    const isExp = expanded.has(projKey);

    // Project-level totals
    const projBudget = pg.categories.reduce((s, c) => s + c.current, 0);
    const projRemaining = pg.categories.reduce((s, c) => s + c.remaining, 0);
    const projSpent = pg.categories.reduce((s, c) => s + c.spent, 0);
    const projItems = pg.categories.flatMap((c) => c.lineItems ?? []);
    const projPrevPaid = projItems.length > 0 ? sumLineItems(projItems, 'previousPaid') : projSpent;
    const projDue = projItems.length > 0 ? sumLineItems(projItems, 'due') : 0;
    const projPct = projBudget > 0 ? (projSpent / projBudget) * 100 : 0;
    const projCO = projItems.length > 0 ? sumLineItems(projItems, 'co') : 0;
    const projPCO = projItems.length > 0 ? sumLineItems(projItems, 'pco') : pg.categories.reduce((s, c) => s + c.potential, 0);
    const projActual = projItems.length > 0 ? sumLineItems(projItems, 'actual') : projSpent;

    return (
      <tbody key={pg.projectId}>
        <tr
          className="border-b border-gray-300 text-sm font-semibold bg-blue-50 cursor-pointer hover:bg-blue-100/70 select-none"
          onClick={() => toggleKey(projKey)}
        >
          <td className="px-3 py-2">
            <span className="inline-flex items-center gap-1">
              {isExp ? <ChevronDown className="text-blue-500 shrink-0" /> : <ChevronRight className="text-blue-500 shrink-0" />}
              {pg.projectName}
            </span>
          </td>
          <td className="px-3 py-2" />
          <td className="px-3 py-2" />
          <td className="px-3 py-2" />
          <td className="px-3 py-2" />
          <td className="px-3 py-2" />
          <td className="px-3 py-2" />
          <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(projBudget)}</td>
          <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(projPrevPaid)}</td>
          <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(projDue)}</td>
          <td className="px-3 py-2 text-right tabular-nums">{formatPercent(projPct)}</td>
          <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(projRemaining)}</td>
          <td className="px-3 py-2 text-right tabular-nums">{projCO ? formatCurrency(projCO) : '—'}</td>
          <td className="px-3 py-2 text-right tabular-nums">{projPCO ? formatCurrency(projPCO) : '—'}</td>
          <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(projActual)}</td>
          <td className="px-2 py-2" />
          <td className="px-2 py-2" />
        </tr>
        {isExp &&
          pg.categories.map((cat) =>
            renderCategoryRow(cat, `cat:${pg.projectId}:${cat.costCode}`, 1),
          )}
      </tbody>
    );
  }

  return (
    <section className="px-4 py-6 max-w-[90rem] mx-auto space-y-8">
      {/* ── Cost Summary Header ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Budget Detail</h2>
          <div className="text-right text-xs">
            <p className="text-gray-500">
              {formatCurrency(budget.totalSpent)} of {formatCurrency(budget.currentBudget)}
            </p>
            <p className="text-gray-700 font-semibold">{formatPercent(budget.percentSpent)} spent</p>
            {budget.totalPotential > 0 && (
              <p className="text-amber-600">+{formatCurrency(budget.totalPotential)} potential</p>
            )}
          </div>
        </div>

        {/* Cost Chart */}
        <CostChart
          categories={budget.categories}
          onSelectCategory={setSelectedCostCode}
        />

        {selectedCategory && (
          <div className="mt-4">
            <CostDrillDown
              category={selectedCategory}
              onClose={() => setSelectedCostCode(null)}
            />
          </div>
        )}
      </div>

      {/* ── Budget Table ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Line Items</h3>
          <button
            onClick={toggleAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded border border-blue-200 hover:border-blue-300 transition-colors"
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {showProjectCol && <th className="px-3 py-3 min-w-[180px]">Project</th>}
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={clsx(
                      'px-3 py-3',
                      col.width,
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-2 py-3 w-10 text-center" title="Attachments">
                  <PaperclipIcon />
                </th>
                <th className="px-2 py-3 w-10 text-center" title="Comments">
                  <ChatIcon />
                </th>
              </tr>
            </thead>

            {/* Grand Total Row */}
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300 text-sm font-bold sticky top-0 z-10">
                {showProjectCol && <td className="px-3 py-3 text-gray-900">All Projects</td>}
                <td className="px-3 py-3 text-gray-900" />
                <td className="px-3 py-3 text-gray-900">Grand Total</td>
                <td className="px-3 py-3" />
                <td className="px-3 py-3" />
                <td className="px-3 py-3" />
                <td className="px-3 py-3" />
                <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(budget.currentBudget)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(grandTotalPrevPaid)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(grandTotalDue)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatPercent(budget.percentSpent)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(budget.totalRemaining)}</td>
                <td className="px-3 py-3 text-right tabular-nums">{grandTotalCO ? formatCurrency(grandTotalCO) : '—'}</td>
                <td className="px-3 py-3 text-right tabular-nums">{grandTotalPCO ? formatCurrency(grandTotalPCO) : '—'}</td>
                <td className="px-3 py-3 text-right tabular-nums">{formatCurrency(grandTotalActual)}</td>
                <td className="px-2 py-3" />
                <td className="px-2 py-3" />
              </tr>
            </thead>

            {/* Body: All Projects mode = project groups, single project = categories */}
            {isAllProjects ? (
              projectGroups.map((pg) => renderProjectGroup(pg))
            ) : (
              <tbody>
                {budget.categories.map((cat) =>
                  renderCategoryRow(cat, `cat:${cat.costCode}`, 0),
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* ── Bid Leveling ── */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Bid Leveling</h3>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Vendor Comparison</h4>
            <VendorComparison bids={VENDOR_BIDS} />
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Bid Package Timeline</h4>
            <BidTimeline milestones={BID_MILESTONES} />
          </div>
        </div>
      </div>
    </section>
  );
}
