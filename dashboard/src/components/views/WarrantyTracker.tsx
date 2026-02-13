'use client';

import { useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import type { WarrantyItem, BudgetComment } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { CommentThread } from '@/components/ui/CommentThread';

/* ── Severity colors ── */
const SEVERITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  standard: 'bg-yellow-100 text-yellow-700',
  monitor: 'bg-gray-100 text-gray-500',
};

/* ── Status colors ── */
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-500',
};

/* ── Filter option types ── */
type SeverityFilter = 'urgent' | 'standard' | 'monitor';
type StatusFilter = 'open' | 'in-progress' | 'resolved' | 'closed';

const SEVERITY_OPTIONS: { key: SeverityFilter; label: string }[] = [
  { key: 'urgent', label: 'Urgent' },
  { key: 'standard', label: 'Standard' },
  { key: 'monitor', label: 'Monitor' },
];

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'closed', label: 'Closed' },
];

/* ── Helpers ── */

function daysUntilExpiry(warrantyEnd: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(warrantyEnd);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatExpiryLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d expired`;
  if (days === 0) return 'Expires today';
  return `${days}d remaining`;
}

interface GroupedByProject {
  projectId: string;
  items: WarrantyItem[];
}

function groupByProject(items: WarrantyItem[]): GroupedByProject[] {
  const map = new Map<string, WarrantyItem[]>();
  for (const item of items) {
    if (!map.has(item.projectId)) map.set(item.projectId, []);
    map.get(item.projectId)!.push(item);
  }
  return Array.from(map.entries()).map(([projectId, items]) => ({ projectId, items }));
}

/* ── Props ── */

interface WarrantyTrackerProps {
  warranties: WarrantyItem[];
  isAllProjects: boolean;
}

/* ── Component ── */

export function WarrantyTracker({ warranties, isAllProjects }: WarrantyTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilters, setSeverityFilters] = useState<Set<SeverityFilter>>(new Set());
  const [statusFilters, setStatusFilters] = useState<Set<StatusFilter>>(new Set());
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [commentOpenFor, setCommentOpenFor] = useState<string | null>(null);
  const [comments, setComments] = useState<BudgetComment[]>([]);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  /* ── Filter logic ── */
  const filtered = useMemo(() => {
    let result = warranties;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (w) =>
          w.unit.toLowerCase().includes(q) ||
          w.issueType.toLowerCase().includes(q) ||
          w.trade.toLowerCase().includes(q) ||
          w.assignedTo.toLowerCase().includes(q),
      );
    }

    if (severityFilters.size > 0) {
      result = result.filter((w) => severityFilters.has(w.severity));
    }

    if (statusFilters.size > 0) {
      result = result.filter((w) => statusFilters.has(w.status));
    }

    return result;
  }, [warranties, searchTerm, severityFilters, statusFilters]);

  /* ── Summary counts (based on unfiltered data) ── */
  const summary = useMemo(() => {
    const total = warranties.length;
    const open = warranties.filter((w) => w.status === 'open').length;
    const inProgress = warranties.filter((w) => w.status === 'in-progress').length;
    const resolved = warranties.filter((w) => w.status === 'resolved').length;
    const urgent = warranties.filter((w) => w.severity === 'urgent').length;
    return { total, open, inProgress, resolved, urgent };
  }, [warranties]);

  /* ── Project groups ── */
  const projectGroups = useMemo(
    () => (isAllProjects ? groupByProject(filtered) : []),
    [filtered, isAllProjects],
  );

  /* ── Toggle helpers ── */
  function toggleSeverity(key: SeverityFilter) {
    setSeverityFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleStatus(key: StatusFilter) {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleProject(projectId: string) {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }

  /* ── Comment handler ── */
  const handleAddComment = useCallback(
    (itemId: string) => (text: string, sendToSlack: boolean) => {
      setComments((prev) => [
        ...prev,
        {
          id: `wty-${Date.now()}`,
          lineItemId: itemId,
          author: 'You',
          timestamp: new Date().toISOString(),
          text,
          source: sendToSlack ? 'slack' : 'dashboard',
        },
      ]);
    },
    [],
  );

  /* ── Slack icon SVG (purple) ── */
  const SlackIcon = (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6 1a2 2 0 00-2 2v3H2a2 2 0 100 4h2v3a2 2 0 104 0v-3h2v3a2 2 0 104 0V10h-2a2 2 0 110-4h2V3a2 2 0 10-4 0v3h-2V3a2 2 0 00-2-2z" />
    </svg>
  );

  /* ── Render a warranty row ── */
  function renderRow(w: WarrantyItem) {
    const days = daysUntilExpiry(w.warrantyEnd);
    const isUrgent = w.severity === 'urgent';
    const isCommentOpen = commentOpenFor === w.id;
    const isHighlighted = highlightedItemId === w.id;

    return (
      <>
        <tr
          key={w.id}
          id={`warranty-row-${w.id}`}
          className={clsx(
            'border-t border-gray-100 hover:bg-gray-50 transition-colors',
            isUrgent && !isHighlighted && 'bg-red-50/50',
            isHighlighted && 'bg-blue-50 ring-1 ring-inset ring-blue-300',
          )}
        >
          <td className="px-3 py-2 font-mono text-gray-700 whitespace-nowrap">{w.id}</td>
          <td className="px-3 py-2 text-gray-800">{w.unit}</td>
          <td className="px-3 py-2 text-gray-700 max-w-[180px] truncate">{w.issueType}</td>
          <td className="px-3 py-2">
            <span
              className={clsx(
                'inline-block px-1.5 py-0.5 rounded text-[10px] font-medium',
                SEVERITY_COLORS[w.severity],
              )}
            >
              {w.severity}
            </span>
          </td>
          <td className="px-3 py-2">
            <span
              className={clsx(
                'inline-block px-1.5 py-0.5 rounded text-[10px] font-medium',
                STATUS_COLORS[w.status],
              )}
            >
              {w.status.replace(/-/g, ' ')}
            </span>
          </td>
          <td className="px-3 py-2 text-gray-600">{w.trade}</td>
          <td className="px-3 py-2 text-gray-600 truncate max-w-[120px]">{w.assignedTo}</td>
          <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{formatDate(w.reportedDate)}</td>
          <td className="px-3 py-2 whitespace-nowrap">
            <div className="text-gray-500">{formatDate(w.warrantyEnd)}</div>
            <div
              className={clsx(
                'text-[10px] font-medium mt-0.5',
                days < 0
                  ? 'text-red-600'
                  : days <= 30
                    ? 'text-amber-600'
                    : 'text-gray-400',
              )}
            >
              {formatExpiryLabel(days)}
            </div>
          </td>
          <td className="px-2 py-2">
            <button
              onClick={() => setCommentOpenFor(isCommentOpen ? null : w.id)}
              className={clsx(
                'p-1 rounded transition-colors',
                isCommentOpen ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-purple-600',
              )}
              title="Slack comment"
            >
              {SlackIcon}
            </button>
          </td>
        </tr>
        {isCommentOpen && (
          <tr key={`${w.id}-comments`}>
            <td colSpan={10} className="px-4 pb-3">
              <CommentThread
                comments={comments}
                lineItemId={w.id}
                onAddComment={handleAddComment(w.id)}
                onClose={() => setCommentOpenFor(null)}
              />
            </td>
          </tr>
        )}
      </>
    );
  }

  /* ── Table header ── */
  const tableHead = (
    <thead>
      <tr className="bg-gray-50 text-gray-500">
        <th className="text-left px-3 py-2 font-medium">Claim #</th>
        <th className="text-left px-3 py-2 font-medium">Unit</th>
        <th className="text-left px-3 py-2 font-medium">Issue Type</th>
        <th className="text-left px-3 py-2 font-medium">Severity</th>
        <th className="text-left px-3 py-2 font-medium">Status</th>
        <th className="text-left px-3 py-2 font-medium">Trade</th>
        <th className="text-left px-3 py-2 font-medium">Assigned To</th>
        <th className="text-left px-3 py-2 font-medium">Reported</th>
        <th className="text-left px-3 py-2 font-medium">Warranty End</th>
        <th className="w-10"></th>
      </tr>
    </thead>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* ── Summary strip ── */}
      <div className="flex flex-wrap gap-3 text-xs mb-4">
        <Pill label="Total Claims" value={summary.total} color="bg-gray-100 text-gray-700" />
        <Pill label="Open" value={summary.open} color="bg-red-100 text-red-700" />
        <Pill label="In Progress" value={summary.inProgress} color="bg-blue-100 text-blue-700" />
        <Pill label="Resolved" value={summary.resolved} color="bg-green-100 text-green-700" />
        <Pill label="Urgent" value={summary.urgent} color="bg-red-100 text-red-700" />
      </div>

      {/* ── Search bar ── */}
      <div className="relative mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by unit, issue type, trade, assignee..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">&#x2315;</span>
      </div>

      {/* ── Filter buttons ── */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Severity filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mr-1">Severity</span>
          {SEVERITY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => toggleSeverity(opt.key)}
              className={clsx(
                'px-2.5 py-1 text-xs rounded-lg border transition-colors',
                severityFilters.has(opt.key)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mr-1">Status</span>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => toggleStatus(opt.key)}
              className={clsx(
                'px-2.5 py-1 text-xs rounded-lg border transition-colors',
                statusFilters.has(opt.key)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Timeline / Gantt chart ── */}
      <WarrantyTimeline
        items={filtered}
        onBarClick={(id) =>
          setHighlightedItemId((prev) => (prev === id ? null : id))
        }
        highlightedItemId={highlightedItemId}
      />

      {/* ── Table ── */}
      {isAllProjects ? (
        /* Grouped by project with collapsible headers */
        <div className="space-y-3">
          {projectGroups.map((group) => {
            const isOpen = expandedProjects.has(group.projectId);
            return (
              <div key={group.projectId} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleProject(group.projectId)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-blue-50 hover:bg-blue-100/70 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-500">{isOpen ? '▾' : '▸'}</span>
                    <span className="text-sm font-semibold text-gray-800">{group.projectId}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                      {group.items.length} claim{group.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-red-600">
                      {group.items.filter((w) => w.severity === 'urgent').length} urgent
                    </span>
                    <span className="text-blue-600">
                      {group.items.filter((w) => w.status === 'in-progress').length} in-progress
                    </span>
                    <span className="text-green-600">
                      {group.items.filter((w) => w.status === 'resolved').length} resolved
                    </span>
                  </div>
                </button>
                {isOpen && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      {tableHead}
                      <tbody>{group.items.map((w) => renderRow(w))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          {projectGroups.length === 0 && (
            <p className="text-sm text-gray-400 py-8 text-center">No warranty claims match your filters.</p>
          )}
        </div>
      ) : (
        /* Single-project flat table */
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              {tableHead}
              <tbody>
                {filtered.map((w) => renderRow(w))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-sm text-gray-400 py-8 text-center">No warranty claims match your filters.</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Warranty Timeline / Gantt chart ── */

/** Bar color per severity (Tailwind classes for background) */
const BAR_SEVERITY_BG: Record<string, string> = {
  urgent: 'bg-red-400',
  standard: 'bg-amber-400',
  monitor: 'bg-gray-300',
};

/** Faded / expired variant */
const BAR_SEVERITY_BG_EXPIRED: Record<string, string> = {
  urgent: 'bg-red-200',
  standard: 'bg-amber-200',
  monitor: 'bg-gray-200',
};

interface WarrantyTimelineProps {
  items: WarrantyItem[];
  onBarClick: (id: string) => void;
  highlightedItemId: string | null;
}

function WarrantyTimeline({ items, onBarClick, highlightedItemId }: WarrantyTimelineProps) {
  /* ── Group items by trade ── */
  const tradeGroups = useMemo(() => {
    const map = new Map<string, WarrantyItem[]>();
    for (const item of items) {
      const trade = item.trade || 'Unassigned';
      if (!map.has(trade)) map.set(trade, []);
      map.get(trade)!.push(item);
    }
    // Sort trades alphabetically
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  /* ── Compute global time range ── */
  const { minDate, maxDate, todayOffset } = useMemo(() => {
    if (items.length === 0) {
      const now = new Date();
      return { minDate: now, maxDate: now, totalDays: 1, todayOffset: 50 };
    }

    let earliest = Infinity;
    let latest = -Infinity;

    for (const item of items) {
      const start = new Date(item.reportedDate).getTime();
      const end = new Date(item.warrantyEnd).getTime();
      if (start < earliest) earliest = start;
      if (end > latest) latest = end;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    // Extend range to include today if it falls outside
    if (todayMs < earliest) earliest = todayMs;
    if (todayMs > latest) latest = todayMs;

    // Add 5% padding on each side
    const rangeMs = latest - earliest || 1;
    const pad = rangeMs * 0.05;
    const paddedMin = earliest - pad;
    const paddedMax = latest + pad;
    const paddedRange = paddedMax - paddedMin;

    const offset = ((todayMs - paddedMin) / paddedRange) * 100;

    return {
      minDate: new Date(paddedMin),
      maxDate: new Date(paddedMax),
      todayOffset: Math.max(0, Math.min(100, offset)),
    };
  }, [items]);

  /* ── Helper: compute bar left% and width% ── */
  function barPosition(reportedDate: string, warrantyEnd: string) {
    const rangeMs = maxDate.getTime() - minDate.getTime() || 1;
    const start = new Date(reportedDate).getTime();
    const end = new Date(warrantyEnd).getTime();

    const leftPct = ((start - minDate.getTime()) / rangeMs) * 100;
    const widthPct = ((end - start) / rangeMs) * 100;

    return {
      left: `${Math.max(0, leftPct)}%`,
      width: `${Math.max(0.5, Math.min(widthPct, 100 - Math.max(0, leftPct)))}%`,
    };
  }

  /* ── Helper: format month labels for the axis ── */
  const monthLabels = useMemo(() => {
    const labels: { label: string; left: string }[] = [];
    const rangeMs = maxDate.getTime() - minDate.getTime() || 1;
    const cursor = new Date(minDate);
    // Start at the first day of the next month
    cursor.setDate(1);
    cursor.setMonth(cursor.getMonth() + 1);
    cursor.setHours(0, 0, 0, 0);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    while (cursor.getTime() <= maxDate.getTime()) {
      const pct = ((cursor.getTime() - minDate.getTime()) / rangeMs) * 100;
      const yr = cursor.getFullYear();
      const mo = cursor.getMonth();
      labels.push({
        label: `${monthNames[mo]} ${yr !== new Date().getFullYear() ? yr : ''}`.trim(),
        left: `${pct}%`,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return labels;
  }, [minDate, maxDate]);

  if (items.length === 0) return null;

  const ROW_H = 28; // px per bar row
  const HEADER_H = 24; // px for trade header

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white">
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Warranty Timeline
        </span>
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-red-400" /> Urgent</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-amber-400" /> Standard</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-gray-300" /> Monitor</span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-2 rounded-sm bg-gray-200" style={{
              backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)',
            }} /> Expired
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        {/* ── Month axis ── */}
        <div className="relative h-5 border-b border-gray-100 bg-gray-50/50">
          {monthLabels.map((m, i) => (
            <span
              key={i}
              className="absolute text-[9px] text-gray-400 font-medium -translate-x-1/2 top-1"
              style={{ left: m.left }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* ── Chart body ── */}
        <div className="relative">
          {/* Today marker (full height, drawn once) */}
          <div
            className="absolute top-0 bottom-0 w-px bg-blue-500 z-10 pointer-events-none"
            style={{ left: `${todayOffset}%` }}
          >
            <span className="absolute -top-0 left-1 text-[8px] font-bold text-blue-600 whitespace-nowrap bg-white/80 px-0.5 rounded">
              Today
            </span>
          </div>

          {tradeGroups.map(([trade, tradeItems]) => {
            // Sort items within a trade by reportedDate
            const sorted = [...tradeItems].sort(
              (a, b) => new Date(a.reportedDate).getTime() - new Date(b.reportedDate).getTime(),
            );

            return (
              <div key={trade}>
                {/* Trade header */}
                <div
                  className="px-3 flex items-center bg-gray-50/80 border-b border-gray-100"
                  style={{ height: HEADER_H }}
                >
                  <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                    {trade}
                  </span>
                  <span className="ml-1.5 text-[9px] text-gray-400">
                    ({sorted.length})
                  </span>
                </div>

                {/* Bars */}
                {sorted.map((item) => {
                  const { left, width } = barPosition(item.reportedDate, item.warrantyEnd);
                  const days = daysUntilExpiry(item.warrantyEnd);
                  const isExpired = days < 0;
                  const isHighlighted = highlightedItemId === item.id;

                  const bgClass = isExpired
                    ? BAR_SEVERITY_BG_EXPIRED[item.severity] ?? 'bg-gray-200'
                    : BAR_SEVERITY_BG[item.severity] ?? 'bg-gray-300';

                  return (
                    <div
                      key={item.id}
                      className={clsx(
                        'relative border-b border-gray-50 px-3',
                        isHighlighted && 'bg-blue-50',
                      )}
                      style={{ height: ROW_H }}
                    >
                      {/* Label on the left side (absolute so it doesn't affect bar) */}
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 font-mono truncate max-w-[60px] pointer-events-none z-[5]">
                        {item.id}
                      </span>

                      {/* The bar */}
                      <button
                        onClick={() => onBarClick(item.id)}
                        title={`${item.id} — ${item.unit} — ${item.issueType}\n${formatDate(item.reportedDate)} to ${formatDate(item.warrantyEnd)}\nSeverity: ${item.severity} | ${isExpired ? 'EXPIRED' : formatExpiryLabel(days)}`}
                        className={clsx(
                          'absolute top-1 rounded-sm cursor-pointer transition-all',
                          'hover:ring-2 hover:ring-blue-400 hover:ring-offset-1',
                          isHighlighted && 'ring-2 ring-blue-500 ring-offset-1',
                          bgClass,
                        )}
                        style={{
                          left,
                          width,
                          height: ROW_H - 8,
                          // Striped pattern for expired
                          ...(isExpired
                            ? {
                                backgroundImage:
                                  'repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(0,0,0,0.10) 3px, rgba(0,0,0,0.10) 6px)',
                              }
                            : {}),
                        }}
                      >
                        {/* Inner label when bar is wide enough */}
                        <span className="absolute inset-0 flex items-center px-1.5 text-[9px] font-medium text-white truncate drop-shadow-sm pointer-events-none">
                          {item.unit} &mdash; {item.issueType}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Pill helper ── */
function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium', color)}>
      {value} {label}
    </span>
  );
}
