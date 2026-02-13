'use client';

import { useMemo, useState, useCallback } from 'react';
import clsx from 'clsx';
import type { OpenTask, BudgetComment, ScheduledSlot, Project } from '@/lib/types';
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
}

export function AttentionToday({ tasks, projects }: AttentionTodayProps) {
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
