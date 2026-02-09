'use client';

import { useMemo, useState, useCallback } from 'react';
import clsx from 'clsx';
import type { OpenTask, BudgetComment, ScheduledSlot, Project } from '@/lib/types';
import { URGENCY_ORDER, URGENCY_COLORS, CATEGORY_COLORS } from '@/lib/constants';
import { applyFilters, groupByUrgency, getFilterOptions } from '@/lib/filters';
import { useFilters } from '@/hooks/useFilters';
import { useDetailPanel } from '@/hooks/useDetailPanel';
import { SearchBar } from '@/components/filters/SearchBar';
import { FilterBar } from '@/components/filters/FilterBar';
import { CountsBar } from '@/components/cards/CountsBar';
import { UrgencyGroup } from '@/components/cards/UrgencyGroup';
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

  // ── Collapsible urgency groups ──
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = useCallback((urgency: string) => {
    setCollapsedGroups((prev) => {
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
      <div className="flex-1 min-w-0 max-w-5xl mx-auto px-4 py-4">
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

        {/* Urgency groups */}
        {filtered.length === 0 ? (
          <EmptyState
            message={
              hasActiveFilters
                ? 'No tasks match your filters.'
                : 'No open tasks. Everything is on track.'
            }
          />
        ) : (
          <div className="space-y-2 mt-2">
            {URGENCY_ORDER.map((urgency) => {
              const groupTasks = grouped[urgency];
              if (groupTasks.length === 0) return null;
              const isCollapsed = collapsedGroups.has(urgency);
              return (
                <div key={urgency}>
                  <button
                    onClick={() => toggleGroup(urgency)}
                    className={clsx('flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5 w-full text-left', URGENCY_COLORS[urgency].text)}
                  >
                    <svg className={clsx('w-3.5 h-3.5 transition-transform shrink-0', !isCollapsed && 'rotate-90')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {urgency === 'due-today' ? 'Due Today' : urgency === 'new' ? 'New' : urgency.charAt(0).toUpperCase() + urgency.slice(1)} ({groupTasks.length})
                  </button>
                  {!isCollapsed && <div className="space-y-1.5">
                    {groupTasks.map((task) => {
                      const isScheduled = scheduledTaskIds.has(task.id);
                      return (
                        <div key={task.id}>
                          <div
                            draggable
                            onDragStart={() => handleDragStart(task.id)}
                            className={clsx(
                              'bg-white rounded-lg border-l-4 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing',
                              URGENCY_COLORS[task.urgency].border,
                              isScheduled && 'ring-2 ring-green-300',
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={clsx('text-[10px] px-1.5 py-0.5 rounded font-medium', CATEGORY_COLORS[task.category])}>
                                    {task.category}
                                  </span>
                                  <span className="text-[10px] font-mono text-gray-400">{task.id}</span>
                                  {task.costCodeRef && (
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1 py-0.5 rounded">{task.costCodeRef}</span>
                                  )}
                                  {isScheduled && (
                                    <span className="text-[10px] bg-green-100 text-green-700 px-1 py-0.5 rounded font-medium">Scheduled</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => select(task.id)}
                                  className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block text-left"
                                >
                                  {task.subject}
                                </button>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs text-gray-500">{task.owner}</span>
                                  <span className="text-[10px] text-gray-300">|</span>
                                  <span className="text-[10px] text-gray-400">
                                    {projects.find((p) => p.id === task.projectId)?.name.split('—')[0].trim() ?? task.projectId}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Slack comment button */}
                                <button
                                  onClick={() => setCommentOpenFor(commentOpenFor === task.id ? null : task.id)}
                                  className={clsx(
                                    'p-1 rounded transition-colors',
                                    commentOpenFor === task.id ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-purple-600',
                                  )}
                                  title="Slack comment"
                                >
                                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M6 1a2 2 0 00-2 2v3H2a2 2 0 100 4h2v3a2 2 0 104 0v-3h2v3a2 2 0 104 0V10h-2a2 2 0 110-4h2V3a2 2 0 10-4 0v3h-2V3a2 2 0 00-2-2z" />
                                  </svg>
                                </button>
                                <div className="text-right">
                                  <span className={clsx('text-xs font-semibold', URGENCY_COLORS[task.urgency].text)}>
                                    {formatUrgencyLabel(task.urgency, task.daysOverdue, task.daysUntilDue)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {/* Deep links */}
                            <div className="flex items-center gap-1 mt-1.5">
                              {task.deepLinks.slice(0, 3).map((link) => (
                                <span key={link.target} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                  {link.target}
                                </span>
                              ))}
                              {task.deepLinks.length > 3 && (
                                <span className="text-[10px] text-gray-400">+{task.deepLinks.length - 3}</span>
                              )}
                            </div>
                          </div>
                          {/* Inline comment thread */}
                          {commentOpenFor === task.id && (
                            <div className="mt-1 ml-4">
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
                  </div>}
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
