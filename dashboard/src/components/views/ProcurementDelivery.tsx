'use client';

import { useMemo, useState, useCallback } from 'react';
import clsx from 'clsx';
import type { OpenTask, BudgetComment } from '@/lib/types';
import type { LeadTimeDetail, SubmittalDetail, InvoiceDetail } from '@/lib/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { AttachmentPopover } from '@/components/ui/AttachmentPopover';
import { CommentThread } from '@/components/ui/CommentThread';
import { CategoryTag } from '@/components/ui/CategoryTag';

interface ProcurementDeliveryProps {
  tasks: OpenTask[];
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

function ChatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h12a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V4a1 1 0 011-1z" />
    </svg>
  );
}

/* ── Helpers ── */

interface CostCodeGroup {
  costCode: string;
  projectId: string;
  projectName: string;
  tasks: OpenTask[];
}

function groupByCostCode(tasks: OpenTask[]): CostCodeGroup[] {
  const map = new Map<string, CostCodeGroup>();
  for (const t of tasks) {
    const cc = t.costCodeRef ?? 'UNASSIGNED';
    const key = `${t.projectId}:${cc}`;
    if (!map.has(key)) {
      const projectName = t.projectId === 'sandbox-001'
        ? 'SandBox — Mixed-Use Development'
        : t.projectId === 'greenfield-002'
          ? 'Greenfield — Retail Center'
          : t.projectId;
      map.set(key, { costCode: cc, projectId: t.projectId, projectName, tasks: [] });
    }
    map.get(key)!.tasks.push(t);
  }
  return Array.from(map.values()).sort((a, b) => a.projectId.localeCompare(b.projectId) || a.costCode.localeCompare(b.costCode));
}

const URGENCY_DOT: Record<string, string> = {
  overdue: 'bg-red-500',
  'due-today': 'bg-yellow-500',
  new: 'bg-blue-500',
  watching: 'bg-gray-400',
};

/* ── Task Row Component ── */

function TaskRow({
  task,
  commentOpenForItem,
  setCommentOpenForItem,
  comments,
  onAddComment,
  commentedItems,
}: {
  task: OpenTask;
  commentOpenForItem: string | null;
  setCommentOpenForItem: (id: string | null) => void;
  comments: BudgetComment[];
  onAddComment: (taskId: string, text: string, sendToSlack: boolean) => void;
  commentedItems: Set<string>;
}) {
  const isCommentOpen = commentOpenForItem === task.id;
  const hasComments = commentedItems.has(task.id);

  return (
    <>
      <tr className="border-b border-gray-100 text-xs hover:bg-gray-50/50">
        {/* Urgency dot */}
        <td className="px-2 py-2 text-center">
          <span className={`inline-block w-2 h-2 rounded-full ${URGENCY_DOT[task.urgency] ?? 'bg-gray-300'}`} title={task.urgency} />
        </td>
        {/* ID */}
        <td className="px-2 py-2 font-mono text-gray-500">{task.id}</td>
        {/* Category */}
        <td className="px-2 py-2">
          <CategoryTag category={task.category} />
        </td>
        {/* Subject */}
        <td className="px-2 py-2 text-gray-800 font-medium max-w-[240px] truncate">{task.subject}</td>
        {/* Owner */}
        <td className="px-2 py-2 text-gray-600">{task.owner}</td>
        {/* Detail columns based on category */}
        {renderDetailCells(task)}
        {/* Attachments */}
        <td className="px-2 py-2 text-center">
          {task.attachments && task.attachments.length > 0 ? (
            <AttachmentPopover attachments={task.attachments} />
          ) : (
            <span className="text-gray-300">—</span>
          )}
        </td>
        {/* Deep Links */}
        <td className="px-2 py-2">
          <div className="flex gap-1 flex-wrap">
            {task.deepLinks.slice(0, 3).map((dl, i) => (
              <a
                key={i}
                href={dl.url}
                className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors truncate max-w-[80px]"
                title={dl.label}
                onClick={(e) => e.stopPropagation()}
              >
                {dl.target}
              </a>
            ))}
          </div>
        </td>
        {/* Comment */}
        <td className="px-2 py-2 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCommentOpenForItem(isCommentOpen ? null : task.id);
            }}
            className={clsx(
              'relative p-0.5 transition-colors',
              isCommentOpen ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600',
            )}
            title="Quick comment"
          >
            <ChatIcon />
            {hasComments && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </button>
        </td>
      </tr>
      {/* Comment thread row */}
      {isCommentOpen && (
        <tr>
          <td colSpan={20} className="px-4 py-2">
            <CommentThread
              comments={comments}
              lineItemId={task.id}
              onAddComment={(text, sendToSlack) => onAddComment(task.id, text, sendToSlack)}
              onClose={() => setCommentOpenForItem(null)}
            />
          </td>
        </tr>
      )}
    </>
  );
}

function renderDetailCells(task: OpenTask) {
  switch (task.detail.type) {
    case 'Lead Time': {
      const d = task.detail as LeadTimeDetail;
      const riskColors =
        d.riskLevel === 'critical' ? 'text-red-600 font-semibold'
          : d.riskLevel === 'at-risk' ? 'text-yellow-600 font-medium'
            : 'text-green-600';
      return (
        <>
          <td className="px-2 py-2 text-gray-600">{d.vendor}</td>
          <td className="px-2 py-2 text-gray-500">{formatDate(d.expectedDelivery)}</td>
          <td className="px-2 py-2">
            <span className={riskColors}>{d.floatDays}d</span>
          </td>
        </>
      );
    }
    case 'Submittal': {
      const d = task.detail as SubmittalDetail;
      return (
        <>
          <td className="px-2 py-2 text-gray-600">{d.vendor}</td>
          <td className="px-2 py-2 text-gray-500">{formatDate(d.reviewDeadline)}</td>
          <td className="px-2 py-2 text-gray-500">Rev {d.revisionNumber}</td>
        </>
      );
    }
    case 'Invoice': {
      const d = task.detail as InvoiceDetail;
      const matchColor = d.matchStatus === 'matched' ? 'text-green-600' : d.matchStatus === 'partial' ? 'text-yellow-600' : 'text-red-600';
      return (
        <>
          <td className="px-2 py-2 text-gray-600">{d.vendor}</td>
          <td className="px-2 py-2 text-gray-700 tabular-nums">{formatCurrency(d.amount)}</td>
          <td className={clsx('px-2 py-2 font-medium', matchColor)}>{d.matchStatus}</td>
        </>
      );
    }
    default:
      return (
        <>
          <td className="px-2 py-2 text-gray-500">{task.source}</td>
          <td className="px-2 py-2 text-gray-500">{formatDate(task.slaDate)}</td>
          <td className="px-2 py-2" />
        </>
      );
  }
}

/* ── Section Component ── */

function ProcurementSection({
  title,
  tasks,
  detailHeaders,
  commentOpenForItem,
  setCommentOpenForItem,
  comments,
  onAddComment,
  commentedItems,
}: {
  title: string;
  tasks: OpenTask[];
  detailHeaders: string[];
  commentOpenForItem: string | null;
  setCommentOpenForItem: (id: string | null) => void;
  comments: BudgetComment[];
  onAddComment: (taskId: string, text: string, sendToSlack: boolean) => void;
  commentedItems: Set<string>;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const groups = useMemo(() => groupByCostCode(tasks), [tasks]);

  function toggleGroup(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Expand all by default if only 1-2 groups
  const defaultExpanded = groups.length <= 2;

  return (
    <section>
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
              <th className="px-2 py-2 w-8" />
              <th className="px-2 py-2 w-24">ID</th>
              <th className="px-2 py-2 w-20">Type</th>
              <th className="px-2 py-2 min-w-[180px]">Subject</th>
              <th className="px-2 py-2 w-24">Owner</th>
              {detailHeaders.map((h) => (
                <th key={h} className="px-2 py-2 w-24">{h}</th>
              ))}
              <th className="px-2 py-2 w-10 text-center">Files</th>
              <th className="px-2 py-2 w-28">Links</th>
              <th className="px-2 py-2 w-10 text-center">Chat</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => {
              const key = `${group.projectId}:${group.costCode}`;
              const isExp = expanded.has(key) || defaultExpanded;
              return (
                <GroupRows
                  key={key}
                  group={group}
                  isExpanded={isExp}
                  onToggle={() => toggleGroup(key)}
                  commentOpenForItem={commentOpenForItem}
                  setCommentOpenForItem={setCommentOpenForItem}
                  comments={comments}
                  onAddComment={onAddComment}
                  commentedItems={commentedItems}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GroupRows({
  group,
  isExpanded,
  onToggle,
  commentOpenForItem,
  setCommentOpenForItem,
  comments,
  onAddComment,
  commentedItems,
}: {
  group: CostCodeGroup;
  isExpanded: boolean;
  onToggle: () => void;
  commentOpenForItem: string | null;
  setCommentOpenForItem: (id: string | null) => void;
  comments: BudgetComment[];
  onAddComment: (taskId: string, text: string, sendToSlack: boolean) => void;
  commentedItems: Set<string>;
}) {
  return (
    <>
      {/* Group header */}
      <tr
        className="bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 select-none"
        onClick={onToggle}
      >
        <td colSpan={20} className="px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            {isExpanded ? <ChevronDown className="text-gray-400 shrink-0" /> : <ChevronRight className="text-gray-400 shrink-0" />}
            <span className="font-semibold text-gray-800">{group.costCode}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{group.projectName}</span>
            <span className="text-[10px] text-gray-400 ml-auto">{group.tasks.length} item{group.tasks.length > 1 ? 's' : ''}</span>
          </div>
        </td>
      </tr>
      {/* Task rows */}
      {isExpanded && group.tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          commentOpenForItem={commentOpenForItem}
          setCommentOpenForItem={setCommentOpenForItem}
          comments={comments}
          onAddComment={onAddComment}
          commentedItems={commentedItems}
        />
      ))}
    </>
  );
}

/* ── Main Component ── */

export function ProcurementDelivery({ tasks }: ProcurementDeliveryProps) {
  const [commentOpenForItem, setCommentOpenForItem] = useState<string | null>(null);
  const [comments, setComments] = useState<BudgetComment[]>([]);

  const commentedItems = useMemo(() => {
    const set = new Set<string>();
    for (const c of comments) set.add(c.lineItemId);
    return set;
  }, [comments]);

  const handleAddComment = useCallback((taskId: string, text: string, _sendToSlack: boolean) => {
    const newComment: BudgetComment = {
      id: `cmt-proc-${Date.now()}`,
      lineItemId: taskId,
      author: 'You',
      timestamp: new Date().toISOString(),
      text,
      source: 'dashboard',
    };
    setComments((prev) => [...prev, newComment]);
    // TODO: If sendToSlack, post via Slack webhook for AI triage
  }, []);

  const leadTimes = tasks.filter((t) => t.category === 'Lead Time');
  const submittals = tasks.filter((t) => t.category === 'Submittal');
  const invoices = tasks.filter((t) => t.category === 'Invoice');
  const changeOrders = tasks.filter((t) => t.category === 'CO');
  const decisions = tasks.filter((t) => t.category === 'Decision');

  return (
    <div className="max-w-[90rem] mx-auto px-4 py-6 space-y-8">
      {/* Lead-Time Risks */}
      {leadTimes.length > 0 && (
        <ProcurementSection
          title="Lead-Time Risks"
          tasks={leadTimes}
          detailHeaders={['Vendor', 'Expected', 'Float']}
          commentOpenForItem={commentOpenForItem}
          setCommentOpenForItem={setCommentOpenForItem}
          comments={comments}
          onAddComment={handleAddComment}
          commentedItems={commentedItems}
        />
      )}

      {/* Submittal Pipeline */}
      {submittals.length > 0 && (
        <ProcurementSection
          title="Submittal Pipeline"
          tasks={submittals}
          detailHeaders={['Vendor', 'Deadline', 'Rev']}
          commentOpenForItem={commentOpenForItem}
          setCommentOpenForItem={setCommentOpenForItem}
          comments={comments}
          onAddComment={handleAddComment}
          commentedItems={commentedItems}
        />
      )}

      {/* Vendor Invoice Status */}
      {invoices.length > 0 && (
        <ProcurementSection
          title="Vendor Invoice Status"
          tasks={invoices}
          detailHeaders={['Vendor', 'Amount', 'Match']}
          commentOpenForItem={commentOpenForItem}
          setCommentOpenForItem={setCommentOpenForItem}
          comments={comments}
          onAddComment={handleAddComment}
          commentedItems={commentedItems}
        />
      )}

      {/* Change Orders */}
      {changeOrders.length > 0 && (
        <ProcurementSection
          title="Change Orders"
          tasks={changeOrders}
          detailHeaders={['Source', 'SLA Date', '']}
          commentOpenForItem={commentOpenForItem}
          setCommentOpenForItem={setCommentOpenForItem}
          comments={comments}
          onAddComment={handleAddComment}
          commentedItems={commentedItems}
        />
      )}

      {/* Decisions */}
      {decisions.length > 0 && (
        <ProcurementSection
          title="Pending Decisions"
          tasks={decisions}
          detailHeaders={['Source', 'Deadline', '']}
          commentOpenForItem={commentOpenForItem}
          setCommentOpenForItem={setCommentOpenForItem}
          comments={comments}
          onAddComment={handleAddComment}
          commentedItems={commentedItems}
        />
      )}
    </div>
  );
}
