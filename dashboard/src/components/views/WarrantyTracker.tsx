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

    return (
      <>
        <tr
          key={w.id}
          className={clsx(
            'border-t border-gray-100 hover:bg-gray-50',
            isUrgent && 'bg-red-50/50',
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

/* ── Pill helper ── */
function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium', color)}>
      {value} {label}
    </span>
  );
}
