'use client';

import { useMemo, useState, useCallback } from 'react';
import clsx from 'clsx';
import type { OpenTask, BudgetComment, ScheduledSlot, Project, ScheduleSummary, CriticalPathData } from '@/lib/types';
import { URGENCY_ORDER, URGENCY_COLORS, URGENCY_LABELS, CATEGORY_COLORS } from '@/lib/constants';
import { applyFilters, groupByUrgency, getFilterOptions } from '@/lib/filters';
import { useFilters } from '@/hooks/useFilters';
import { useDetailPanel } from '@/hooks/useDetailPanel';
import { SearchBar } from '@/components/filters/SearchBar';
import { FilterBar } from '@/components/filters/FilterBar';
import { CountsBar } from '@/components/cards/CountsBar';

import { DetailPanel } from '@/components/detail/DetailPanel';
import { EmptyState } from '@/components/ui/EmptyState';
import { CommentThread } from '@/components/ui/CommentThread';
import { formatUrgencyLabel } from '@/lib/utils';

/* ── Helper: build 7-day date range starting today ── */
function buildWeek(): { date: string; label: string; dayLabel: string; isToday: boolean }[] {
  const days: { date: string; label: string; dayLabel: string; isToday: boolean }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    days.push({
      date: iso,
      label: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      dayLabel: dayNames[d.getDay()],
      isToday: i === 0,
    });
  }
  return days;
}

const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
function hourLabel(h: number): string {
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
}

interface AttentionTodayProps {
  tasks: OpenTask[];
  projects: Project[];
  schedule: ScheduleSummary;
  criticalPath: CriticalPathData;
}

/* ── Schedule status colors ── */
const SCHEDULE_STATUS_COLORS = {
  'on-track': { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-300', badge: 'bg-green-100 text-green-700' },
  'at-risk': { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-50', border: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-700' },
  'behind': { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-300', badge: 'bg-red-100 text-red-700' },
} as const;

const MILESTONE_STATUS_COLORS = {
  completed: { bg: 'bg-green-500', text: 'text-green-700' },
  'in-progress': { bg: 'bg-blue-500', text: 'text-blue-700' },
  upcoming: { bg: 'bg-gray-300', text: 'text-gray-500' },
  'at-risk': { bg: 'bg-red-500', text: 'text-red-700' },
} as const;

export function AttentionToday({ tasks, projects, schedule, criticalPath }: AttentionTodayProps) {
  const {
    filters,
    setSearch,
    toggleCategory,
    toggleOwner,
    toggleUrgency,
    toggleCostCode,
    toggleProject,
    clearFilters,
    hasActiveFilters,
  } = useFilters();

  const { selectedId, select, close } = useDetailPanel();

  const filtered = useMemo(() => applyFilters(tasks, filters), [tasks, filters]);
  const grouped = useMemo(() => groupByUrgency(filtered), [filtered]);
  const { owners, costCodes, projects: projectIds } = useMemo(() => getFilterOptions(tasks), [tasks]);
  const projectList = useMemo(
    () => projects.filter((p) => projectIds.includes(p.id)),
    [projects, projectIds],
  );

  const selectedTask = selectedId ? tasks.find((t) => t.id === selectedId) ?? null : null;

  // ── Expanded rows state ──
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const toggleRow = useCallback((urgency: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(urgency)) next.delete(urgency);
      else next.add(urgency);
      return next;
    });
  }, []);

  // ── Slack comment state ──
  const [commentOpenFor, setCommentOpenFor] = useState<string | null>(null);
  const [comments, setComments] = useState<BudgetComment[]>([]);

  const handleAddComment = useCallback(
    (taskId: string) => (text: string, sendToSlack: boolean) => {
      const c: BudgetComment = {
        id: `c-${Date.now()}`,
        lineItemId: taskId,
        author: 'You',
        timestamp: new Date().toISOString(),
        text,
        source: sendToSlack ? 'slack' : 'dashboard',
      };
      setComments((prev) => [...prev, c]);
    },
    [],
  );

  // ── Calendar state ──
  const week = useMemo(() => buildWeek(), []);
  const [scheduled, setScheduled] = useState<ScheduledSlot[]>([]);
  const [calendarProject, setCalendarProject] = useState<string>('all');
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);

  const calendarTasks = useMemo(() => {
    if (calendarProject === 'all') return filtered;
    return filtered.filter((t) => t.projectId === calendarProject);
  }, [filtered, calendarProject]);

  const scheduledMap = useMemo(() => {
    const m = new Map<string, ScheduledSlot[]>();
    const slots = calendarProject === 'all'
      ? scheduled
      : scheduled.filter((s) => s.projectId === calendarProject);
    for (const s of slots) {
      const key = `${s.date}-${s.hour}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(s);
    }
    return m;
  }, [scheduled, calendarProject]);

  // ── Drag handlers ──
  function handleDragStart(taskId: string) {
    setDragTaskId(taskId);
  }

  function handleDragOver(e: React.DragEvent, cellKey: string) {
    e.preventDefault();
    setDragOverCell(cellKey);
  }

  function handleDragLeave() {
    setDragOverCell(null);
  }

  function handleDrop(date: string, hour: number) {
    if (!dragTaskId) return;
    const task = tasks.find((t) => t.id === dragTaskId);
    if (!task) return;

    // Remove existing slot for this task if re-scheduling
    setScheduled((prev) => [
      ...prev.filter((s) => s.taskId !== dragTaskId),
      { taskId: dragTaskId, date, hour, projectId: task.projectId },
    ]);
    setDragTaskId(null);
    setDragOverCell(null);
  }

  function handleRemoveSlot(taskId: string) {
    setScheduled((prev) => prev.filter((s) => s.taskId !== taskId));
  }

  const scheduledTaskIds = new Set(scheduled.map((s) => s.taskId));

  // ── Ask Anything chatbot state ──
  const [askOpen, setAskOpen] = useState(false);
  const [askInput, setAskInput] = useState('');
  const [askMessages, setAskMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [askTyping, setAskTyping] = useState(false);

  const overdueCount = grouped['overdue']?.length ?? 0;
  const dueTodayCount = grouped['due-today']?.length ?? 0;
  const totalOpen = filtered.length;
  const atRiskPhases = schedule.phases.filter((p) => p.status === 'at-risk' || p.status === 'behind');

  const generateAIResponse = useCallback((input: string): string => {
    const q = input.toLowerCase();
    if (q.includes('overdue') || q.includes('late')) {
      return `There are currently **${overdueCount} overdue tasks**. The most critical ones involve ${grouped['overdue']?.slice(0, 3).map((t) => t.category).join(', ') || 'various categories'}. I recommend prioritizing these in today's standup.`;
    }
    if (q.includes('today') || q.includes('summary') || q.includes('status')) {
      return `**Today's Summary:** ${totalOpen} open tasks total — ${overdueCount} overdue, ${dueTodayCount} due today. Schedule is ${schedule.overallStatus === 'on-track' ? 'on track' : schedule.overallStatus === 'at-risk' ? 'at risk' : 'behind'}${atRiskPhases.length > 0 ? ` with ${atRiskPhases.length} phase(s) needing attention: ${atRiskPhases.map((p) => p.name).join(', ')}` : ''}.`;
    }
    if (q.includes('report') || q.includes('daily')) {
      return `**Daily Report Draft:**\n\n- **Open Tasks:** ${totalOpen} (${overdueCount} overdue, ${dueTodayCount} due today)\n- **Schedule:** ${schedule.overallStatus === 'on-track' ? 'On Track' : schedule.overallStatus === 'at-risk' ? 'At Risk' : 'Behind'}\n- **Key Actions:** Follow up on overdue items, review at-risk phases\n\nWould you like me to refine this or add specific sections?`;
    }
    if (q.includes('schedule') || q.includes('milestone') || q.includes('phase')) {
      const phaseList = schedule.phases.map((p) => `${p.name}: ${p.percentComplete}% (${p.status}${p.daysVariance !== 0 ? `, ${p.daysVariance}d variance` : ''})`).join('\n- ');
      return `**Schedule Overview:**\n- ${phaseList}\n\nOverall status: **${schedule.overallStatus}**`;
    }
    if (q.includes('budget') || q.includes('cost') || q.includes('spend')) {
      return `For detailed budget information, check the **Budget Detail** tab. I can help you draft a change order or review specific cost codes. What would you like to focus on?`;
    }
    if (q.includes('rfi') || q.includes('submittal')) {
      return `I can help draft an RFI or review submittals. Please provide the subject, description, and any relevant drawing references, and I'll prepare a draft for your review.`;
    }
    if (q.includes('change order') || q.includes(' co ') || q.includes('co#')) {
      return `To draft a Change Order, I'll need:\n1. Description of the change\n2. Affected cost code(s)\n3. Estimated cost impact\n4. Schedule impact (if any)\n\nPlease provide these details and I'll prepare the CO draft.`;
    }
    return `I can help with project questions, draft reports, create RFIs, or review task status. You have **${totalOpen} open tasks** and the schedule is **${schedule.overallStatus}**. What specific area would you like to explore?`;
  }, [overdueCount, dueTodayCount, totalOpen, schedule, atRiskPhases, grouped, filtered.length]);

  const handleAskSend = useCallback(() => {
    if (!askInput.trim()) return;
    const userMsg = askInput.trim();
    setAskMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setAskInput('');
    setAskTyping(true);
    setTimeout(() => {
      setAskMessages((prev) => [...prev, { role: 'ai', text: generateAIResponse(userMsg) }]);
      setAskTyping(false);
    }, 600);
  }, [askInput, generateAIResponse]);

  const ASK_SUGGESTIONS = [
    "What's overdue?",
    'Summarize today',
    'Draft daily report',
    'Schedule status',
    'Help with RFI',
    'Draft change order',
  ];

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1 min-w-0 max-w-7xl mx-auto px-4 py-4">
        {/* Search */}
        <SearchBar value={filters.search} onChange={setSearch} />

        {/* Filters */}
        <div className="mt-3">
          <FilterBar
            filters={filters}
            owners={owners}
            costCodes={costCodes}
            projects={projectList}
            onToggleCategory={toggleCategory}
            onToggleOwner={toggleOwner}
            onToggleUrgency={toggleUrgency}
            onToggleCostCode={toggleCostCode}
            onToggleProject={toggleProject}
            onClear={clearFilters}
            hasActive={hasActiveFilters}
          />
        </div>

        {/* Counts */}
        <CountsBar tasks={filtered} />

        {/* Kanban Board */}
        {filtered.length === 0 ? (
          <EmptyState
            message={
              hasActiveFilters
                ? 'No tasks match your filters.'
                : 'No open tasks. Everything is on track.'
            }
          />
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mt-3 items-start">
            {URGENCY_ORDER.map((urgency) => {
              const groupTasks = grouped[urgency];
              const isExpanded = expandedRows.has(urgency);
              const visible = isExpanded ? groupTasks : groupTasks.slice(0, 5);
              const overflow = groupTasks.length - 5;

              return (
                <div
                  key={urgency}
                  className="rounded-lg border border-gray-200 bg-gray-50/50 flex flex-col"
                >
                  {/* Column header */}
                  <div className={clsx('px-3 py-2 border-b border-gray-200 flex items-center justify-between rounded-t-lg', URGENCY_COLORS[urgency].bg)}>
                    <div className="flex items-center gap-2">
                      <div className={clsx('w-2 h-2 rounded-full', URGENCY_COLORS[urgency].border.replace('border-', 'bg-'))} />
                      <span className={clsx('text-xs font-semibold uppercase tracking-wider', URGENCY_COLORS[urgency].text)}>
                        {URGENCY_LABELS[urgency]}
                      </span>
                    </div>
                    <span className={clsx('text-[10px] font-bold min-w-[20px] text-center px-1.5 py-0.5 rounded-full', URGENCY_COLORS[urgency].bg, URGENCY_COLORS[urgency].text)}>
                      {groupTasks.length}
                    </span>
                  </div>

                  {/* Card stack */}
                  <div className="p-2 space-y-2">
                    {groupTasks.length === 0 && (
                      <p className="text-[10px] text-gray-400 italic text-center py-6">No tasks</p>
                    )}

                    {visible.map((task) => {
                      const isScheduled = scheduledTaskIds.has(task.id);
                      return (
                        <div key={task.id}>
                          <div
                            draggable
                            onDragStart={() => handleDragStart(task.id)}
                            className={clsx(
                              'bg-white rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-gray-200',
                              isScheduled && 'ring-2 ring-green-300',
                            )}
                          >
                            {/* Category + id */}
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium', CATEGORY_COLORS[task.category])}>
                                {task.category}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">{task.id}</span>
                              {isScheduled && (
                                <span className="text-[10px] bg-green-100 text-green-700 px-1 py-0.5 rounded font-medium">Sched</span>
                              )}
                            </div>

                            {/* Subject */}
                            <button
                              onClick={() => select(task.id)}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 text-left w-full"
                            >
                              {task.subject}
                            </button>

                            {/* Owner + project */}
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[10px] text-gray-500 truncate">{task.owner}</span>
                              <span className="text-[10px] text-gray-300">|</span>
                              <span className="text-[10px] text-gray-400 truncate">
                                {projects.find((p) => p.id === task.projectId)?.name.split('—')[0].trim() ?? task.projectId}
                              </span>
                            </div>

                            {/* Bottom: urgency + chat + attach */}
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100">
                              <span className={clsx('text-[10px] font-semibold', URGENCY_COLORS[task.urgency].text)}>
                                {formatUrgencyLabel(task.urgency, task.daysOverdue, task.daysUntilDue)}
                              </span>
                              <div className="flex items-center gap-1">
                                {/* Chat / conversation button */}
                                <button
                                  onClick={() => setCommentOpenFor(commentOpenFor === task.id ? null : task.id)}
                                  className={clsx(
                                    'p-1 rounded transition-colors',
                                    commentOpenFor === task.id ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-600',
                                  )}
                                  title="Open conversation"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                                  </svg>
                                </button>
                                {/* Attachment button */}
                                <button
                                  onClick={() => select(task.id)}
                                  className="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors"
                                  title="View attachments"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                          {/* Inline comment thread below card */}
                          {commentOpenFor === task.id && (
                            <div className="mt-1.5">
                              <CommentThread
                                comments={comments}
                                lineItemId={task.id}
                                onAddComment={handleAddComment(task.id)}
                                onClose={() => setCommentOpenFor(null)}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* +N more */}
                    {overflow > 0 && !isExpanded && (
                      <button
                        onClick={() => toggleRow(urgency)}
                        className="w-full py-2 rounded-lg border-2 border-dashed border-gray-300 text-center hover:bg-gray-100 transition-colors"
                      >
                        <span className={clsx('text-xs font-semibold', URGENCY_COLORS[urgency].text)}>+{overflow} more</span>
                      </button>
                    )}

                    {/* Show less */}
                    {isExpanded && overflow > 0 && (
                      <button
                        onClick={() => toggleRow(urgency)}
                        className="w-full py-1.5 rounded-lg text-center text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Show less
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Schedule Overview ── */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Schedule Overview</h2>
            <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', SCHEDULE_STATUS_COLORS[schedule.overallStatus].badge)}>
              {schedule.overallStatus === 'on-track' ? 'On Track' : schedule.overallStatus === 'at-risk' ? 'At Risk' : 'Behind'}
            </span>
          </div>

          {/* Summary row */}
          <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
            <span>
              <strong className="text-gray-800">{schedule.phases.length}</strong> phases
            </span>
            <span>
              <strong className="text-green-600">{schedule.phases.filter((p) => p.status === 'on-track').length}</strong> on track
            </span>
            <span>
              <strong className="text-yellow-600">{schedule.phases.filter((p) => p.status === 'at-risk').length}</strong> at risk
            </span>
            <span>
              <strong className="text-red-600">{schedule.phases.filter((p) => p.status === 'behind').length}</strong> behind
            </span>
            <span className="ml-auto text-gray-500">
              Overall completion:{' '}
              <strong className="text-gray-800">
                {schedule.phases.length > 0
                  ? Math.round(schedule.phases.reduce((sum, p) => sum + p.percentComplete, 0) / schedule.phases.length)
                  : 0}%
              </strong>
            </span>
          </div>

          {/* Compact milestone strip */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex gap-1">
              {criticalPath.milestones.map((ms) => {
                const msColors = MILESTONE_STATUS_COLORS[ms.status];
                const schedPhase = schedule.phases.find((p) => p.name === ms.phase);
                return (
                  <div key={ms.phase} className="flex-1 min-w-0">
                    <div
                      className={clsx('h-6 rounded flex items-center justify-center px-1 relative overflow-hidden', msColors.bg)}
                      title={`${ms.phase}: ${ms.percentComplete}% complete — ${ms.status}`}
                    >
                      {/* Progress fill */}
                      <div
                        className="absolute inset-y-0 left-0 bg-white/20 rounded-l"
                        style={{ width: `${ms.percentComplete}%` }}
                      />
                      <span className="text-white text-[9px] font-semibold truncate relative z-10">{ms.phase}</span>
                    </div>
                    <div className="mt-0.5 text-center">
                      <span className={clsx('text-[10px] font-semibold', msColors.text)}>{ms.percentComplete}%</span>
                      {schedPhase && schedPhase.daysVariance < 0 && (
                        <span className="text-[9px] text-red-600 ml-1">{schedPhase.daysVariance}d</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* At-risk / behind items */}
          {schedule.phases.filter((p) => p.status === 'at-risk' || p.status === 'behind').length > 0 && (
            <div className="mt-3 space-y-1.5">
              {schedule.phases
                .filter((p) => p.status === 'at-risk' || p.status === 'behind')
                .map((phase) => {
                  const colors = SCHEDULE_STATUS_COLORS[phase.status];
                  return (
                    <div
                      key={phase.id}
                      className={clsx('flex items-center gap-3 px-3 py-2 rounded-lg border text-xs', colors.light, colors.border)}
                    >
                      <span className={clsx('w-2 h-2 rounded-full shrink-0', colors.bg)} />
                      <span className="font-medium text-gray-800">{phase.name}</span>
                      <span className={clsx('font-semibold', colors.text)}>
                        {phase.status === 'at-risk' ? 'At Risk' : 'Behind'}
                      </span>
                      <span className="text-gray-500">{phase.percentComplete}% complete</span>
                      {phase.daysVariance !== 0 && (
                        <span className={clsx('ml-auto font-semibold', phase.daysVariance < 0 ? 'text-red-600' : 'text-green-600')}>
                          {phase.daysVariance > 0 ? '+' : ''}{phase.daysVariance}d variance
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* ── 7-Day Calendar ── */}
        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">7-Day Logistics Calendar</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">View:</span>
              <button
                onClick={() => setCalendarProject('all')}
                className={clsx(
                  'text-xs px-2 py-1 rounded transition-colors',
                  calendarProject === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                Combined
              </button>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setCalendarProject(p.id)}
                  className={clsx(
                    'text-xs px-2 py-1 rounded transition-colors',
                    calendarProject === p.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {p.name.split('—')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-gray-400 mb-2">
            Drag tasks from above into time slots to schedule. Click a scheduled task to remove.
          </p>

          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-xs border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 border-r border-gray-200 w-16 text-gray-500 font-medium">Time</th>
                  {week.map((day) => (
                    <th
                      key={day.date}
                      className={clsx(
                        'text-center p-2 border-r border-gray-200 font-medium',
                        day.isToday ? 'bg-blue-50 text-blue-700' : 'text-gray-600',
                      )}
                    >
                      <div>{day.dayLabel}</div>
                      <div className="text-[10px] font-normal">{day.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour} className="border-t border-gray-100">
                    <td className="p-1.5 border-r border-gray-200 text-gray-400 font-mono text-[10px] whitespace-nowrap">
                      {hourLabel(hour)}
                    </td>
                    {week.map((day) => {
                      const cellKey = `${day.date}-${hour}`;
                      const cellSlots = scheduledMap.get(cellKey) ?? [];
                      const isDragOver = dragOverCell === cellKey;
                      return (
                        <td
                          key={cellKey}
                          className={clsx(
                            'p-1 border-r border-gray-200 align-top min-h-[40px] h-10 transition-colors',
                            day.isToday && 'bg-blue-50/30',
                            isDragOver && 'bg-blue-100',
                          )}
                          onDragOver={(e) => handleDragOver(e, cellKey)}
                          onDragLeave={handleDragLeave}
                          onDrop={() => handleDrop(day.date, hour)}
                        >
                          {cellSlots.map((slot) => {
                            const t = tasks.find((tk) => tk.id === slot.taskId);
                            if (!t) return null;
                            return (
                              <button
                                key={slot.taskId}
                                onClick={() => handleRemoveSlot(slot.taskId)}
                                className={clsx(
                                  'block w-full text-left px-1 py-0.5 rounded text-[10px] mb-0.5 truncate border-l-2',
                                  URGENCY_COLORS[t.urgency].border,
                                  URGENCY_COLORS[t.urgency].bg,
                                )}
                                title={`${t.id}: ${t.subject} — click to remove`}
                              >
                                <span className="font-medium">{t.id}</span>{' '}
                                <span className="text-gray-500">{t.subject.slice(0, 20)}</span>
                              </button>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unscheduled tasks summary */}
          {calendarTasks.length > 0 && (
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              <span>
                <strong className="text-gray-700">{calendarTasks.length - calendarTasks.filter((t) => scheduledTaskIds.has(t.id)).length}</strong> unscheduled
              </span>
              <span>
                <strong className="text-green-600">{calendarTasks.filter((t) => scheduledTaskIds.has(t.id)).length}</strong> scheduled
              </span>
            </div>
          )}
        </div>

        {/* ── Ask Anything ── */}
        <div className="mt-8 border-t border-gray-200 pt-6 pb-4">
          {!askOpen ? (
            <button
              onClick={() => setAskOpen(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all group"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className="text-left">
                <div className="text-sm font-semibold">Ask Anything</div>
                <div className="text-xs text-blue-200">Get project insights, draft reports, create RFIs, review status</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="ml-auto opacity-50 group-hover:opacity-100 transition-opacity">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span className="text-sm font-semibold text-white">Ask Anything</span>
                  <span className="text-xs text-blue-200">AI-powered project assistant</span>
                </div>
                <button
                  onClick={() => setAskOpen(false)}
                  className="text-white/70 hover:text-white transition-colors p-1"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="max-h-[320px] overflow-y-auto p-4 space-y-3 bg-gray-50">
                {askMessages.length === 0 && (
                  <div className="text-center py-6">
                    <div className="text-gray-400 text-sm mb-1">How can I help?</div>
                    <div className="text-gray-300 text-xs">Ask about tasks, schedule, budget, or request help drafting documents</div>
                  </div>
                )}
                {askMessages.map((msg, i) => (
                  <div key={i} className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div
                      className={clsx(
                        'max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap',
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                      )}
                    >
                      {msg.text.split('**').map((part, pi) =>
                        pi % 2 === 1
                          ? <strong key={pi}>{part}</strong>
                          : <span key={pi}>{part}</span>
                      )}
                    </div>
                  </div>
                ))}
                {askTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 text-gray-400 px-3 py-2 rounded-lg rounded-bl-sm shadow-sm text-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestion chips */}
              <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-gray-100">
                {ASK_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setAskInput(s); }}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
                <input
                  type="text"
                  value={askInput}
                  onChange={(e) => setAskInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAskSend(); }}
                  placeholder="Ask about your project..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAskSend}
                  disabled={!askInput.trim()}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    askInput.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  )}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <DetailPanel
        task={selectedTask}
        allTasks={tasks}
        onClose={close}
        onSelectTask={select}
      />
    </div>
  );
}
