'use client';

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { CriticalPathData, ScheduleSummary, MilestonePhase, MilestoneActivity, Role } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface CriticalPathProps {
  criticalPath: CriticalPathData;
  schedule: ScheduleSummary;
}

type ViewMode = 'gantt' | 'calendar';

const STATUS_COLORS = {
  completed: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100', border: 'border-green-300' },
  'in-progress': { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100', border: 'border-blue-300' },
  upcoming: { bg: 'bg-gray-300', text: 'text-gray-500', light: 'bg-gray-100', border: 'border-gray-300' },
  'at-risk': { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100', border: 'border-red-300' },
} as const;

const PHASE_ORDER: MilestonePhase[] = ['Entitlement', 'Precon', 'Superstructure', 'Rough-ins', 'Finishes', 'Closeout'];

const ROLE_ORDER: Role[] = ['PM', 'Super', 'Principal', "Owner's Rep", 'Procurement', 'Ops'];

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

function daysBetween(start: string, end: string): number {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
}

function daysFromStart(start: string, date: string): number {
  return Math.max(0, Math.ceil((new Date(date).getTime() - new Date(start).getTime()) / 86400000));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatShortDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* ── Component ── */

export function CriticalPath({ criticalPath, schedule }: CriticalPathProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('gantt');
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['Rough-ins', 'Finishes']));
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [expandedCell, setExpandedCell] = useState<string | null>(null);

  // Group activities by milestone phase
  const activitiesByPhase = useMemo(() => {
    const map = new Map<MilestonePhase, MilestoneActivity[]>();
    for (const phase of PHASE_ORDER) map.set(phase, []);
    for (const act of criticalPath.activities) {
      const list = map.get(act.milestonePhase);
      if (list) list.push(act);
    }
    return map;
  }, [criticalPath.activities]);

  // Gantt date range
  const ganttRange = useMemo(() => {
    const allDates = [
      ...criticalPath.milestones.map((m) => m.startDate),
      ...criticalPath.milestones.map((m) => m.endDate),
    ];
    const sorted = allDates.map((d) => new Date(d).getTime()).sort((a, b) => a - b);
    const start = new Date(sorted[0]);
    const end = new Date(sorted[sorted.length - 1]);
    return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
  }, [criticalPath.milestones]);

  const totalDays = daysBetween(ganttRange.start, ganttRange.end);

  function togglePhase(phase: string) {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  }

  /* ── Milestone Overview Strip ── */
  function renderMilestoneStrip() {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Milestone Overview</h3>
        <div className="flex gap-1">
          {criticalPath.milestones.map((ms) => {
            const colors = STATUS_COLORS[ms.status];
            const width = `${Math.max(8, (daysBetween(ms.startDate, ms.endDate) / totalDays) * 100)}%`;
            return (
              <div key={ms.phase} className="flex-1 min-w-0" style={{ width }}>
                <div className={`h-8 rounded ${colors.bg} flex items-center justify-center px-1`}>
                  <span className="text-white text-[10px] font-semibold truncate">{ms.phase}</span>
                </div>
                <div className="mt-1 text-center">
                  <span className="text-[10px] text-gray-500 block leading-tight">
                    {formatDate(ms.startDate).replace(', 2026', '').replace(', 2025', '')} — {formatDate(ms.endDate).replace(', 2026', '').replace(', 2025', '')}
                  </span>
                  <span className={`text-[10px] font-semibold ${colors.text}`}>
                    {ms.percentComplete}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Gantt Chart ── */
  function renderGantt() {
    // Generate month markers
    const startDate = new Date(ganttRange.start);
    const endDate = new Date(ganttRange.end);
    const months: { label: string; offset: number; width: number }[] = [];
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (cursor <= endDate) {
      const monthStart = cursor > startDate ? cursor : startDate;
      const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      const monthEnd = nextMonth > endDate ? endDate : new Date(nextMonth.getTime() - 86400000);
      const offset = daysFromStart(ganttRange.start, monthStart.toISOString().split('T')[0]);
      const width = daysBetween(monthStart.toISOString().split('T')[0], monthEnd.toISOString().split('T')[0]);
      months.push({
        label: monthStart.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        offset,
        width,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const selectedAct = selectedActivity
      ? criticalPath.activities.find((a) => a.id === selectedActivity) ?? null
      : null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Month headers */}
        <div className="relative h-7 bg-gray-50 border-b border-gray-200 flex">
          <div className="w-64 shrink-0 border-r border-gray-200 px-3 flex items-center text-xs font-semibold text-gray-600">
            Activity
          </div>
          <div className="flex-1 relative">
            {months.map((m, i) => (
              <div
                key={i}
                className="absolute top-0 h-full flex items-center border-l border-gray-200 px-1"
                style={{ left: `${(m.offset / totalDays) * 100}%`, width: `${(m.width / totalDays) * 100}%` }}
              >
                <span className="text-[10px] text-gray-500 font-medium">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {PHASE_ORDER.map((phase) => {
            const milestone = criticalPath.milestones.find((m) => m.phase === phase);
            if (!milestone) return null;
            const activities = activitiesByPhase.get(phase) ?? [];
            const isExpanded = expandedPhases.has(phase);
            const colors = STATUS_COLORS[milestone.status];

            return (
              <div key={phase}>
                {/* Phase row */}
                <div
                  className={clsx('flex items-center h-9 cursor-pointer hover:bg-gray-50 select-none', colors.light)}
                  onClick={() => togglePhase(phase)}
                >
                  <div className="w-64 shrink-0 px-3 flex items-center gap-1 text-sm font-semibold">
                    {activities.length > 0 ? (
                      isExpanded ? <ChevronDown className="text-gray-400 shrink-0" /> : <ChevronRight className="text-gray-400 shrink-0" />
                    ) : (
                      <span className="w-4" />
                    )}
                    <span className={colors.text}>{phase}</span>
                    <span className="text-[10px] text-gray-400 ml-1">({milestone.percentComplete}%)</span>
                  </div>
                  <div className="flex-1 relative h-full flex items-center px-1">
                    {/* Phase bar */}
                    <div
                      className={`h-5 rounded ${colors.bg} opacity-60`}
                      style={{
                        marginLeft: `${(daysFromStart(ganttRange.start, milestone.startDate) / totalDays) * 100}%`,
                        width: `${(daysBetween(milestone.startDate, milestone.endDate) / totalDays) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Activity rows */}
                {isExpanded && activities.map((act) => {
                  const actColors = STATUS_COLORS[act.status];
                  const isSelected = selectedActivity === act.id;
                  return (
                    <div key={act.id}>
                      <div
                        className={clsx('flex items-center h-8 cursor-pointer hover:bg-blue-50/50', isSelected && 'bg-blue-50')}
                        onClick={() => setSelectedActivity(isSelected ? null : act.id)}
                      >
                        <div className="w-64 shrink-0 px-3 pl-10 flex items-center gap-1.5 text-xs text-gray-700 truncate">
                          <span className="text-gray-400">{act.costCode}</span>
                          <span className="truncate">{act.trade.split(' — ')[0]}</span>
                        </div>
                        <div className="flex-1 relative h-full flex items-center px-1">
                          <div
                            className={`h-4 rounded ${actColors.bg}`}
                            style={{
                              marginLeft: `${(daysFromStart(ganttRange.start, act.startDate) / totalDays) * 100}%`,
                              width: `${Math.max(0.5, (daysBetween(act.startDate, act.endDate) / totalDays) * 100)}%`,
                            }}
                          >
                            {act.percentComplete > 0 && (
                              <div
                                className="h-full bg-white/30 rounded-l"
                                style={{ width: `${act.percentComplete}%` }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Activity detail panel */}
                      {isSelected && (
                        <div className="bg-blue-50 border-y border-blue-100 px-10 py-3">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-gray-400 uppercase text-[10px]">Description</span>
                              <p className="text-gray-800 font-medium">{act.description}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase text-[10px]">Trade</span>
                              <p className="text-gray-800">{act.trade}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase text-[10px]">Owner</span>
                              <p className="text-gray-800">{act.owner} ({act.role})</p>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase text-[10px]">Progress</span>
                              <p className={actColors.text}>{act.percentComplete}% — {act.status}</p>
                            </div>
                            <div>
                              <span className="text-gray-400 uppercase text-[10px]">Dates</span>
                              <p className="text-gray-800">{formatDate(act.startDate)} — {formatDate(act.endDate)}</p>
                            </div>
                            {act.linkedTaskIds.length > 0 && (
                              <div>
                                <span className="text-gray-400 uppercase text-[10px]">Linked Tasks</span>
                                <p className="text-gray-800">{act.linkedTaskIds.join(', ')}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── 30-Day Calendar ── */
  function renderCalendar() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: Date[] = [];
    for (let i = 0; i < 30; i++) days.push(addDays(today, i));

    // Get activities that fall within the 30-day window
    const windowEnd = addDays(today, 30);
    const activeActivities = criticalPath.activities.filter((act) => {
      const start = new Date(act.startDate);
      const end = new Date(act.endDate);
      return start <= windowEnd && end >= today;
    });

    // Group by role
    const byRole = new Map<Role, MilestoneActivity[]>();
    for (const role of ROLE_ORDER) byRole.set(role, []);
    for (const act of activeActivities) {
      const list = byRole.get(act.role);
      if (list) list.push(act);
    }

    // Filter to roles that have activities
    const activeRoles = ROLE_ORDER.filter((r) => (byRole.get(r) ?? []).length > 0);

    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600 sticky left-0 bg-gray-50 z-10 w-28 min-w-[112px]">
                Role
              </th>
              {days.map((d, i) => {
                const isToday = isSameDay(d, today);
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <th
                    key={i}
                    className={clsx(
                      'px-0.5 py-1 text-center min-w-[32px] font-medium',
                      isToday && 'bg-blue-100 text-blue-700',
                      isWeekend && !isToday && 'bg-gray-100 text-gray-400',
                      !isToday && !isWeekend && 'text-gray-500',
                    )}
                  >
                    <div className="text-[9px]">{d.toLocaleString('en-US', { weekday: 'short' }).charAt(0)}</div>
                    <div className="text-[10px]">{d.getDate()}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {activeRoles.map((role) => {
              const roleActs = byRole.get(role) ?? [];
              return (
                <tr key={role} className="border-b border-gray-100">
                  <td className="px-2 py-2 text-xs font-medium text-gray-700 sticky left-0 bg-white z-10 border-r border-gray-100">
                    {role}
                  </td>
                  {days.map((d, di) => {
                    const isToday = isSameDay(d, today);
                    const dayActs = roleActs.filter((act) => {
                      const start = new Date(act.startDate);
                      const end = new Date(act.endDate);
                      start.setHours(0, 0, 0, 0);
                      end.setHours(0, 0, 0, 0);
                      return d >= start && d <= end;
                    });
                    const cellKey = `${role}-${di}`;
                    const isCellExpanded = expandedCell === cellKey;

                    if (dayActs.length === 0) {
                      return (
                        <td
                          key={di}
                          className={clsx(
                            'px-0.5 py-1 text-center',
                            isToday && 'bg-blue-50',
                          )}
                        />
                      );
                    }

                    return (
                      <td
                        key={di}
                        className={clsx(
                          'px-0.5 py-1 text-center relative cursor-pointer',
                          isToday && 'bg-blue-50',
                        )}
                        onClick={() => setExpandedCell(isCellExpanded ? null : cellKey)}
                      >
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          {dayActs.length <= 2 ? (
                            dayActs.map((act) => {
                              const colors = STATUS_COLORS[act.status];
                              return (
                                <span
                                  key={act.id}
                                  className={`inline-block w-2.5 h-2.5 rounded-sm ${colors.bg}`}
                                  title={`${act.costCode} — ${act.description}`}
                                />
                              );
                            })
                          ) : (
                            <span className="text-[10px] font-semibold text-gray-600">{dayActs.length}</span>
                          )}
                        </div>
                        {/* Expanded cell detail */}
                        {isCellExpanded && (
                          <div className="absolute z-50 left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-left">
                            <div className="text-[10px] font-semibold text-gray-500 mb-1">
                              {formatShortDate(d)} — {role}
                            </div>
                            <div className="space-y-1">
                              {dayActs.map((act) => {
                                const colors = STATUS_COLORS[act.status];
                                return (
                                  <div key={act.id} className={`p-1.5 rounded ${colors.light} ${colors.border} border`}>
                                    <div className="text-[10px] font-medium text-gray-800">{act.costCode} — {act.trade.split(' — ')[0]}</div>
                                    <div className="text-[10px] text-gray-600 truncate">{act.description}</div>
                                    <div className={`text-[9px] font-semibold ${colors.text}`}>{act.percentComplete}% — {act.milestonePhase}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {activeRoles.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-400">
            No activities in the next 30 days.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[90rem] mx-auto px-4 py-6 space-y-6">
      {/* Sub-navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Critical Path</h2>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            className={clsx(
              'px-4 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'gantt' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
            )}
            onClick={() => setViewMode('gantt')}
          >
            Gantt
          </button>
          <button
            className={clsx(
              'px-4 py-1.5 text-sm font-medium transition-colors border-l border-gray-200',
              viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
            )}
            onClick={() => setViewMode('calendar')}
          >
            30-Day Calendar
          </button>
        </div>
      </div>

      {/* Milestone Overview Strip — always visible */}
      {renderMilestoneStrip()}

      {/* View content */}
      {viewMode === 'gantt' ? renderGantt() : renderCalendar()}
    </div>
  );
}
