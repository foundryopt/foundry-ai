'use client';

import { useMemo, useState, useCallback } from 'react';
import clsx from 'clsx';
import type { QAQCData, QAQCDocument, QCChecklist, OpenTask, BudgetComment, EscalationType } from '@/lib/types';
import { URGENCY_COLORS, CATEGORY_COLORS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { CommentThread } from '@/components/ui/CommentThread';

/* ── Sub-nav tabs ── */
type QATab = 'documents' | 'checklists' | 'rfi-log' | 'co-log' | 'escalate';
const QA_TABS: { key: QATab; label: string }[] = [
  { key: 'documents', label: 'Document Library' },
  { key: 'checklists', label: 'QC Checklists' },
  { key: 'rfi-log', label: 'RFI Log' },
  { key: 'co-log', label: 'CO Log' },
  { key: 'escalate', label: 'Escalate' },
];

/* ── Status colors ── */
const DOC_STATUS_COLORS: Record<string, string> = {
  current: 'bg-green-100 text-green-700',
  'pending-review': 'bg-yellow-100 text-yellow-700',
  'revision-needed': 'bg-red-100 text-red-700',
  superseded: 'bg-gray-100 text-gray-500',
};

const CHECK_STATUS_COLORS: Record<string, string> = {
  pass: 'bg-green-100 text-green-700',
  fail: 'bg-red-100 text-red-700',
  na: 'bg-gray-100 text-gray-500',
  pending: 'bg-yellow-100 text-yellow-700',
};

const CHECKLIST_OVERALL_COLORS: Record<string, string> = {
  complete: 'bg-green-100 text-green-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  'not-started': 'bg-gray-100 text-gray-500',
};

/* ── Type icons ── */
const DOC_TYPE_ICONS: Record<string, string> = {
  Drawing: 'DWG',
  Spec: 'SPEC',
  'Install Instruction': 'INST',
  'QC Report': 'QCR',
  Submittal: 'SUB',
};

interface QAQCProps {
  qaqc: QAQCData;
  tasks: OpenTask[];
  isAllProjects: boolean;
}

export function QAQC({ qaqc, tasks, isAllProjects }: QAQCProps) {
  const [activeTab, setActiveTab] = useState<QATab>('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null);
  const [commentOpenFor, setCommentOpenFor] = useState<string | null>(null);
  const [comments, setComments] = useState<BudgetComment[]>([]);

  // Escalation form state
  const [escType, setEscType] = useState<EscalationType>('RFI');
  const [escSubject, setEscSubject] = useState('');
  const [escDescription, setEscDescription] = useState('');
  const [escCostCode, setEscCostCode] = useState('');
  const [escLinkedDocs, setEscLinkedDocs] = useState('');
  const [escSubmitted, setEscSubmitted] = useState(false);

  const handleAddComment = useCallback(
    (itemId: string) => (text: string, sendToSlack: boolean) => {
      setComments((prev) => [
        ...prev,
        {
          id: `qc-${Date.now()}`,
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

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // ── Filter documents ──
  const filteredDocs = useMemo(() => {
    if (!searchTerm) return qaqc.documents;
    const q = searchTerm.toLowerCase();
    return qaqc.documents.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.costCode.toLowerCase().includes(q) ||
        d.trade.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q),
    );
  }, [qaqc.documents, searchTerm]);

  // ── Group documents by cost code ──
  const docGroups = useMemo(() => {
    const groups = new Map<string, QAQCDocument[]>();
    for (const doc of filteredDocs) {
      const key = isAllProjects ? `${doc.projectId}|${doc.costCode}` : doc.costCode;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(doc);
    }
    return groups;
  }, [filteredDocs, isAllProjects]);

  // ── RFI tasks ──
  const rfiTasks = useMemo(() => tasks.filter((t) => t.category === 'RFI'), [tasks]);
  const coTasks = useMemo(() => tasks.filter((t) => t.category === 'CO'), [tasks]);

  // ── Filter checklists ──
  const filteredChecklists = useMemo(() => {
    if (!searchTerm) return qaqc.checklists;
    const q = searchTerm.toLowerCase();
    return qaqc.checklists.filter(
      (c) =>
        c.activity.toLowerCase().includes(q) ||
        c.costCode.toLowerCase().includes(q) ||
        c.trade.toLowerCase().includes(q),
    );
  }, [qaqc.checklists, searchTerm]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {/* Sub-navigation */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto">
        {QA_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors',
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {activeTab !== 'escalate' && (
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, cost code, trade..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">&#x2315;</span>
        </div>
      )}

      {/* ════════ DOCUMENTS TAB ════════ */}
      {activeTab === 'documents' && (
        <div className="space-y-3">
          {/* Summary strip */}
          <div className="flex gap-3 text-xs">
            <Pill label="Total" value={qaqc.documents.length} color="bg-gray-100 text-gray-700" />
            <Pill label="Current" value={qaqc.documents.filter((d) => d.status === 'current').length} color="bg-green-100 text-green-700" />
            <Pill label="Pending Review" value={qaqc.documents.filter((d) => d.status === 'pending-review').length} color="bg-yellow-100 text-yellow-700" />
            <Pill label="Revision Needed" value={qaqc.documents.filter((d) => d.status === 'revision-needed').length} color="bg-red-100 text-red-700" />
          </div>

          {/* Grouped by cost code */}
          {[...docGroups.entries()].map(([groupKey, docs]) => {
            const isOpen = expandedGroups.has(groupKey);
            const ccLabel = isAllProjects
              ? `${docs[0].costCode} — ${docs[0].trade}`
              : `${docs[0].costCode} — ${docs[0].trade}`;
            const projLabel = isAllProjects ? docs[0].projectId : null;

            return (
              <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{isOpen ? '▾' : '▸'}</span>
                    <span className="text-sm font-medium text-gray-800">{ccLabel}</span>
                    {projLabel && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{projLabel}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{docs.length} docs</span>
                </button>
                {isOpen && (
                  <div className="divide-y divide-gray-100">
                    {docs.map((doc) => (
                      <div key={doc.id}>
                        <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                          {/* Type badge */}
                          <span className="text-[10px] font-mono font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded w-10 text-center shrink-0">
                            {DOC_TYPE_ICONS[doc.type] ?? doc.type}
                          </span>
                          {/* Title + meta */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <a href={doc.fileUrl} className="text-sm text-gray-900 hover:text-blue-600 font-medium truncate" onClick={(e) => e.stopPropagation()}>
                                {doc.title}
                              </a>
                              <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium', DOC_STATUS_COLORS[doc.status])}>
                                {doc.status.replace(/-/g, ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                              <span>Rev {doc.revision}</span>
                              <span>|</span>
                              <span>{formatDate(doc.lastUpdated)}</span>
                              {doc.linkedTaskIds.length > 0 && (
                                <>
                                  <span>|</span>
                                  <span className="text-orange-500">Linked: {doc.linkedTaskIds.join(', ')}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {doc.fieldwireUrl && (
                              <a
                                href={doc.fieldwireUrl}
                                className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded hover:bg-indigo-100 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Fieldwire
                              </a>
                            )}
                            <a
                              href={doc.fileUrl}
                              className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded hover:bg-gray-200 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View
                            </a>
                            <button
                              onClick={() => setCommentOpenFor(commentOpenFor === doc.id ? null : doc.id)}
                              className={clsx(
                                'p-1 rounded transition-colors',
                                commentOpenFor === doc.id ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-purple-600',
                              )}
                              title="Comment"
                            >
                              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M6 1a2 2 0 00-2 2v3H2a2 2 0 100 4h2v3a2 2 0 104 0v-3h2v3a2 2 0 104 0V10h-2a2 2 0 110-4h2V3a2 2 0 10-4 0v3h-2V3a2 2 0 00-2-2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {commentOpenFor === doc.id && (
                          <div className="px-4 pb-3">
                            <CommentThread
                              comments={comments}
                              lineItemId={doc.id}
                              onAddComment={handleAddComment(doc.id)}
                              onClose={() => setCommentOpenFor(null)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {docGroups.size === 0 && <p className="text-sm text-gray-400 py-8 text-center">No documents match your search.</p>}
        </div>
      )}

      {/* ════════ CHECKLISTS TAB ════════ */}
      {activeTab === 'checklists' && (
        <div className="space-y-3">
          {/* Summary */}
          <div className="flex gap-3 text-xs">
            <Pill label="Complete" value={qaqc.checklists.filter((c) => c.overallStatus === 'complete').length} color="bg-green-100 text-green-700" />
            <Pill label="In Progress" value={qaqc.checklists.filter((c) => c.overallStatus === 'in-progress').length} color="bg-blue-100 text-blue-700" />
            <Pill label="Not Started" value={qaqc.checklists.filter((c) => c.overallStatus === 'not-started').length} color="bg-gray-100 text-gray-500" />
          </div>

          {filteredChecklists.map((checklist) => {
            const isExpanded = expandedChecklist === checklist.id;
            const passCount = checklist.items.filter((i) => i.status === 'pass').length;
            const failCount = checklist.items.filter((i) => i.status === 'fail').length;
            const pendingCount = checklist.items.filter((i) => i.status === 'pending').length;

            return (
              <div key={checklist.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedChecklist(isExpanded ? null : checklist.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{isExpanded ? '▾' : '▸'}</span>
                      <span className="text-sm font-medium text-gray-800">{checklist.activity}</span>
                      <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium', CHECKLIST_OVERALL_COLORS[checklist.overallStatus])}>
                        {checklist.overallStatus.replace(/-/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 ml-5 text-[10px] text-gray-400">
                      <span>{checklist.costCode} — {checklist.trade}</span>
                      <span>|</span>
                      <span>{checklist.location}</span>
                      {checklist.linkedTaskIds.length > 0 && (
                        <>
                          <span>|</span>
                          <span className="text-orange-500">Linked: {checklist.linkedTaskIds.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] shrink-0">
                    <span className="text-green-600">{passCount}P</span>
                    <span className="text-red-600">{failCount}F</span>
                    <span className="text-yellow-600">{pendingCount}?</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500">
                          <th className="text-left px-4 py-1.5 font-medium">Check Item</th>
                          <th className="text-center px-2 py-1.5 font-medium w-20">Status</th>
                          <th className="text-left px-2 py-1.5 font-medium w-24">Inspector</th>
                          <th className="text-left px-2 py-1.5 font-medium w-24">Date</th>
                          <th className="text-left px-2 py-1.5 font-medium">Notes</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {checklist.items.map((item) => (
                          <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50">
                            <td className="px-4 py-2 text-gray-800">{item.label}</td>
                            <td className="text-center px-2 py-2">
                              <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-medium', CHECK_STATUS_COLORS[item.status])}>
                                {item.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-gray-500">{item.inspector ?? '—'}</td>
                            <td className="px-2 py-2 text-gray-500">{item.date ? formatDate(item.date) : '—'}</td>
                            <td className="px-2 py-2 text-gray-500 truncate max-w-[200px]">{item.notes ?? ''}</td>
                            <td className="px-2 py-2">
                              <button
                                onClick={() => setCommentOpenFor(commentOpenFor === item.id ? null : item.id)}
                                className={clsx(
                                  'p-0.5 rounded transition-colors',
                                  commentOpenFor === item.id ? 'text-purple-600' : 'text-gray-300 hover:text-purple-600',
                                )}
                              >
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M6 1a2 2 0 00-2 2v3H2a2 2 0 100 4h2v3a2 2 0 104 0v-3h2v3a2 2 0 104 0V10h-2a2 2 0 110-4h2V3a2 2 0 10-4 0v3h-2V3a2 2 0 00-2-2z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {commentOpenFor && checklist.items.some((i) => i.id === commentOpenFor) && (
                      <div className="px-4 py-2 border-t border-gray-100">
                        <CommentThread
                          comments={comments}
                          lineItemId={commentOpenFor}
                          onAddComment={handleAddComment(commentOpenFor)}
                          onClose={() => setCommentOpenFor(null)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filteredChecklists.length === 0 && <p className="text-sm text-gray-400 py-8 text-center">No checklists match your search.</p>}
        </div>
      )}

      {/* ════════ RFI LOG TAB ════════ */}
      {activeTab === 'rfi-log' && (
        <div>
          <div className="flex gap-3 text-xs mb-3">
            <Pill label="Total RFIs" value={rfiTasks.length} color="bg-indigo-100 text-indigo-700" />
            <Pill label="Overdue" value={rfiTasks.filter((t) => t.urgency === 'overdue').length} color="bg-red-100 text-red-700" />
            <Pill label="Open" value={rfiTasks.filter((t) => t.urgency !== 'watching').length} color="bg-yellow-100 text-yellow-700" />
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-3 py-2 font-medium">RFI #</th>
                  <th className="text-left px-3 py-2 font-medium">Subject</th>
                  <th className="text-left px-3 py-2 font-medium">Discipline</th>
                  <th className="text-left px-3 py-2 font-medium">Owner</th>
                  <th className="text-center px-3 py-2 font-medium">Status</th>
                  <th className="text-left px-3 py-2 font-medium">Deadline</th>
                  <th className="text-left px-3 py-2 font-medium">Linked Docs</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {rfiTasks
                  .filter((t) => !searchTerm || t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.subject.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((task) => {
                    const detail = task.detail.type === 'RFI' ? task.detail : null;
                    return (
                      <tr key={task.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-gray-700">{task.id}</td>
                        <td className="px-3 py-2 text-gray-800 max-w-[200px] truncate">{task.subject}</td>
                        <td className="px-3 py-2 text-gray-500">{detail?.discipline ?? '—'}</td>
                        <td className="px-3 py-2 text-gray-500">{task.owner}</td>
                        <td className="text-center px-3 py-2">
                          <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-medium', URGENCY_COLORS[task.urgency].bg, URGENCY_COLORS[task.urgency].text)}>
                            {task.urgency === 'overdue' ? `${task.daysOverdue}d overdue` : task.urgency === 'due-today' ? 'Due Today' : task.urgency}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-500">{detail?.responseDeadline ? formatDate(detail.responseDeadline) : formatDate(task.slaDate)}</td>
                        <td className="px-3 py-2 text-gray-500 text-[10px]">
                          {task.qualityAffected?.join(', ') ?? '—'}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => setCommentOpenFor(commentOpenFor === task.id ? null : task.id)}
                            className={clsx(
                              'p-0.5 rounded transition-colors',
                              commentOpenFor === task.id ? 'text-purple-600' : 'text-gray-300 hover:text-purple-600',
                            )}
                          >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M6 1a2 2 0 00-2 2v3H2a2 2 0 100 4h2v3a2 2 0 104 0v-3h2v3a2 2 0 104 0V10h-2a2 2 0 110-4h2V3a2 2 0 10-4 0v3h-2V3a2 2 0 00-2-2z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {commentOpenFor && rfiTasks.some((t) => t.id === commentOpenFor) && (
            <div className="mt-2 max-w-xl">
              <CommentThread
                comments={comments}
                lineItemId={commentOpenFor}
                onAddComment={handleAddComment(commentOpenFor)}
                onClose={() => setCommentOpenFor(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* ════════ CO LOG TAB ════════ */}
      {activeTab === 'co-log' && (
        <div>
          <div className="flex gap-3 text-xs mb-3">
            <Pill label="Total COs" value={coTasks.length} color="bg-orange-100 text-orange-700" />
            <Pill label="Overdue" value={coTasks.filter((t) => t.urgency === 'overdue').length} color="bg-red-100 text-red-700" />
            <Pill
              label="Total Cost Impact"
              value={`$${(coTasks.reduce((s, t) => s + (t.costImpact ?? 0), 0) / 1000).toFixed(0)}K`}
              color="bg-amber-100 text-amber-700"
              isText
            />
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-3 py-2 font-medium">PCO #</th>
                  <th className="text-left px-3 py-2 font-medium">Subject</th>
                  <th className="text-left px-3 py-2 font-medium">Cost Code</th>
                  <th className="text-right px-3 py-2 font-medium">Est. Cost</th>
                  <th className="text-left px-3 py-2 font-medium">Submitted By</th>
                  <th className="text-center px-3 py-2 font-medium">Status</th>
                  <th className="text-left px-3 py-2 font-medium">Linked RFIs</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {coTasks
                  .filter((t) => !searchTerm || t.id.toLowerCase().includes(searchTerm.toLowerCase()) || t.subject.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((task) => {
                    const detail = task.detail.type === 'CO' ? task.detail : null;
                    return (
                      <tr key={task.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2 font-mono text-gray-700">{detail?.pcoNumber ?? task.id}</td>
                        <td className="px-3 py-2 text-gray-800 max-w-[200px] truncate">{task.subject}</td>
                        <td className="px-3 py-2 text-gray-500">{detail?.costCode ?? task.costCodeRef ?? '—'}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                          {detail?.estimatedCost ? `$${detail.estimatedCost.toLocaleString()}` : '—'}
                        </td>
                        <td className="px-3 py-2 text-gray-500 truncate max-w-[150px]">{detail?.submittedBy ?? '—'}</td>
                        <td className="text-center px-3 py-2">
                          <span className={clsx('px-1.5 py-0.5 rounded text-[10px] font-medium', URGENCY_COLORS[task.urgency].bg, URGENCY_COLORS[task.urgency].text)}>
                            {task.urgency === 'overdue' ? `${task.daysOverdue}d overdue` : task.urgency}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[10px] text-gray-500">{detail?.linkedRfis?.join(', ') ?? '—'}</td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => setCommentOpenFor(commentOpenFor === task.id ? null : task.id)}
                            className={clsx(
                              'p-0.5 rounded transition-colors',
                              commentOpenFor === task.id ? 'text-purple-600' : 'text-gray-300 hover:text-purple-600',
                            )}
                          >
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M6 1a2 2 0 00-2 2v3H2a2 2 0 100 4h2v3a2 2 0 104 0v-3h2v3a2 2 0 104 0V10h-2a2 2 0 110-4h2V3a2 2 0 10-4 0v3h-2V3a2 2 0 00-2-2z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {commentOpenFor && coTasks.some((t) => t.id === commentOpenFor) && (
            <div className="mt-2 max-w-xl">
              <CommentThread
                comments={comments}
                lineItemId={commentOpenFor}
                onAddComment={handleAddComment(commentOpenFor)}
                onClose={() => setCommentOpenFor(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* ════════ ESCALATION TAB ════════ */}
      {activeTab === 'escalate' && (
        <div className="max-w-lg">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Escalate to RFI or Change Order</h3>
          <p className="text-xs text-gray-500 mb-4">
            Use this form to formally escalate an issue from the field, QC inspection, or document review into an RFI or CO for tracking and resolution.
          </p>

          {escSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
              <strong>Escalation submitted.</strong> A new {escType} draft has been created and routed for review.
              <button
                onClick={() => { setEscSubmitted(false); setEscSubject(''); setEscDescription(''); setEscCostCode(''); setEscLinkedDocs(''); }}
                className="block mt-2 text-xs text-green-600 underline"
              >
                Submit another
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setEscSubmitted(true); }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <div className="flex gap-2">
                  {(['RFI', 'CO'] as EscalationType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEscType(t)}
                      className={clsx(
                        'px-3 py-1.5 text-xs rounded-lg border transition-colors',
                        escType === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={escSubject}
                  onChange={(e) => setEscSubject(e.target.value)}
                  required
                  placeholder={escType === 'RFI' ? 'e.g. Clarification needed on framing detail at...' : 'e.g. Additional cost for rerouted ductwork at...'}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={escDescription}
                  onChange={(e) => setEscDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe the issue, what was found during inspection, and what resolution is needed..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cost Code</label>
                  <input
                    type="text"
                    value={escCostCode}
                    onChange={(e) => setEscCostCode(e.target.value)}
                    placeholder="e.g. 23-00"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Linked Documents</label>
                  <input
                    type="text"
                    value={escLinkedDocs}
                    onChange={(e) => setEscLinkedDocs(e.target.value)}
                    placeholder="e.g. DWG-M102, SPEC-2300"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!escSubject.trim() || !escDescription.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Submit {escType} Escalation
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Pill helper ── */
function Pill({ label, value, color, isText }: { label: string; value: number | string; color: string; isText?: boolean }) {
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium', color)}>
      {isText ? String(value) : value} {label}
    </span>
  );
}
