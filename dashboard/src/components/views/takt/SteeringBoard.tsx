'use client';

import React, { useState, useMemo } from 'react';
import clsx from 'clsx';

export interface Sub {
  name: string;
  abbrev: string;
  color: string;
  trade: string;
}

export interface TaktTask {
  id: string;
  sub: string;
  zone: string;
  day: number;
  duration: number;
  status: 'draft' | 'planned' | 'active' | 'done' | 'blocked';
}

export interface Milestone {
  id: string;
  label: string;
  day: number;
  zone: string;
}

interface SteeringBoardProps {
  subs: Sub[];
  zones: string[];
  days: number;
  tasks: TaktTask[];
  milestones: Milestone[];
  onTaskDrop: (taskId: string, zone: string, day: number) => void;
  onTaskClick: (task: TaktTask) => void;
  onAddTask: (task: TaktTask) => void;
  onDeleteTask: (taskId: string) => void;
  onAddMilestone: () => void;
  onAddSub?: (sub: Sub) => void;
}

const PRESET_COLORS = [
  '#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#dc2626',
  '#6b7280', '#0891b2', '#db2777', '#4b5563', '#059669',
  '#0284c7', '#92400e', '#15803d', '#64748b', '#e11d48',
  '#8b5cf6',
];

const STATUS_COLORS: Record<TaktTask['status'], string> = {
  draft: 'bg-gray-200 border-gray-400 text-gray-700',
  planned: 'bg-blue-200 border-blue-400 text-blue-800',
  active: 'bg-yellow-200 border-yellow-400 text-yellow-800',
  done: 'bg-green-200 border-green-400 text-green-800',
  blocked: 'bg-red-200 border-red-400 text-red-800',
};

export function SteeringBoard({
  subs,
  zones,
  days,
  tasks,
  milestones,
  onTaskDrop,
  onTaskClick,
  onAddTask,
  onDeleteTask,
  onAddMilestone,
  onAddSub,
}: SteeringBoardProps) {
  const dayHeaders = Array.from({ length: days }, (_, i) => i + 1);

  // Add-task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskSub, setTaskSub] = useState(subs[0]?.abbrev ?? '');
  const [taskZone, setTaskZone] = useState(zones[0]);
  const [taskDay, setTaskDay] = useState(1);
  const [taskDuration, setTaskDuration] = useState(2);
  const [taskStatus, setTaskStatus] = useState<TaktTask['status']>('draft');

  const resetTaskForm = () => {
    setShowTaskForm(false);
    setTaskSub(subs[0]?.abbrev ?? '');
    setTaskZone(zones[0]);
    setTaskDay(1);
    setTaskDuration(2);
    setTaskStatus('draft');
  };

  const submitNewTask = () => {
    if (!taskSub) return;
    onAddTask({
      id: `t${Date.now()}`,
      sub: taskSub,
      zone: taskZone,
      day: taskDay,
      duration: taskDuration,
      status: taskStatus,
    });
    resetTaskForm();
  };

  // Trade-grouped sub-contractor state
  const [collapsedTrades, setCollapsedTrades] = useState<Set<string>>(new Set());
  const [addingForTrade, setAddingForTrade] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState('');
  const [newSubAbbrev, setNewSubAbbrev] = useState('');
  const [newSubColor, setNewSubColor] = useState(PRESET_COLORS[0]);

  const tradeGroups = useMemo(() => {
    const grouped: Record<string, Sub[]> = {};
    for (const s of subs) {
      if (!grouped[s.trade]) grouped[s.trade] = [];
      grouped[s.trade].push(s);
    }
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [subs]);

  const toggleTrade = (trade: string) => {
    setCollapsedTrades((prev) => {
      const next = new Set(prev);
      if (next.has(trade)) next.delete(trade);
      else next.add(trade);
      return next;
    });
  };

  const resetAddForm = () => {
    setAddingForTrade(null);
    setNewSubName('');
    setNewSubAbbrev('');
    setNewSubColor(PRESET_COLORS[0]);
  };

  const handleSubmitNewSub = (trade: string) => {
    const trimmedName = newSubName.trim();
    const trimmedAbbrev = newSubAbbrev.trim().toUpperCase();
    if (!trimmedName || trimmedAbbrev.length !== 2) return;
    if (subs.some((s) => s.abbrev === trimmedAbbrev)) return;
    onAddSub?.({ name: trimmedName, abbrev: trimmedAbbrev, color: newSubColor, trade });
    resetAddForm();
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, zone: string, day: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) onTaskDrop(taskId, zone, day);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Takt Steering Board</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className={clsx(
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              showTaskForm
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-green-600 text-white hover:bg-green-700'
            )}
          >
            {showTaskForm ? 'Cancel' : '+ Task'}
          </button>
          <button
            onClick={onAddMilestone}
            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            + Milestone
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {showTaskForm && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Add Task to Board</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Sub-Contractor</label>
              <select
                value={taskSub}
                onChange={(e) => setTaskSub(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {subs.map((s) => (
                  <option key={s.abbrev} value={s.abbrev}>{s.abbrev} — {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Zone</label>
              <select
                value={taskZone}
                onChange={(e) => setTaskZone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {zones.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Start Day</label>
              <input
                type="number"
                min={1}
                max={days}
                value={taskDay}
                onChange={(e) => setTaskDay(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Duration (days)</label>
              <input
                type="number"
                min={1}
                value={taskDuration}
                onChange={(e) => setTaskDuration(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Status</label>
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value as TaktTask['status'])}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="planned">Planned</option>
                <option value="active">Active</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={submitNewTask}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Add to Board
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <span key={status} className={clsx('px-2 py-0.5 rounded border capitalize', cls)}>
            {status}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <div
          className="inline-grid min-w-max"
          style={{
            gridTemplateColumns: `120px repeat(${days}, 48px)`,
          }}
        >
          {/* Column headers */}
          <div className="bg-gray-100 border-b border-r border-gray-200 px-2 py-2 text-xs font-semibold text-gray-600 sticky left-0 z-10">
            Zone
          </div>
          {dayHeaders.map((d) => (
            <div
              key={d}
              className="bg-gray-100 border-b border-r border-gray-200 px-1 py-2 text-xs text-center font-medium text-gray-600"
            >
              D{d}
            </div>
          ))}

          {/* Zone rows */}
          {zones.map((zone) => (
            <React.Fragment key={zone}>
              {/* Zone label */}
              <div className="bg-gray-50 border-b border-r border-gray-200 px-2 py-3 text-sm font-medium text-gray-800 sticky left-0 z-10">
                {zone}
              </div>

              {/* Day cells */}
              {dayHeaders.map((d) => {
                const cellTasks = tasks.filter(
                  (t) => t.zone === zone && d >= t.day && d < t.day + t.duration
                );
                const cellMilestones = milestones.filter(
                  (m) => m.zone === zone && m.day === d
                );

                return (
                  <div
                    key={d}
                    className="relative border-b border-r border-gray-200 min-h-[40px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, zone, d)}
                  >
                    {cellTasks.map((task) => {
                      const sub = subs.find((s) => s.abbrev === task.sub);
                      const isStart = task.day === d;
                      return isStart ? (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => onTaskClick(task)}
                          className={clsx(
                            'absolute top-0.5 left-0.5 h-[34px] rounded text-[10px] font-semibold flex items-center justify-center cursor-grab border z-20',
                            STATUS_COLORS[task.status]
                          )}
                          style={{
                            width: `${task.duration * 48 - 4}px`,
                            backgroundColor: sub?.color ? `${sub.color}33` : undefined,
                            borderColor: sub?.color || undefined,
                          }}
                          title={`${sub?.name ?? task.sub} — ${task.status}`}
                        >
                          {task.sub}
                        </div>
                      ) : null;
                    })}

                    {cellMilestones.map((ms) => (
                      <div
                        key={ms.id}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-500 z-30"
                        title={ms.label}
                      />
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Sub-contractor legend — grouped by trade */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Sub-Contractors</h4>
        <div className="space-y-2">
          {tradeGroups.map(([trade, tradeSubs]) => {
            const isCollapsed = collapsedTrades.has(trade);
            const isAdding = addingForTrade === trade;

            return (
              <div key={trade} className="border border-gray-100 rounded-lg">
                {/* Trade header */}
                <button
                  type="button"
                  onClick={() => toggleTrade(trade)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{trade}</span>
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600">
                      {tradeSubs.length}
                    </span>
                  </div>
                  <svg
                    className={clsx(
                      'w-4 h-4 text-gray-500 transition-transform',
                      isCollapsed ? '-rotate-90' : 'rotate-0'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Trade body — subs + add button */}
                {!isCollapsed && (
                  <div className="px-3 pb-3 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {tradeSubs.map((s) => (
                        <span
                          key={s.abbrev}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border"
                          style={{ borderColor: s.color, backgroundColor: `${s.color}15`, color: s.color }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.abbrev} — {s.name}
                        </span>
                      ))}

                      {/* "+" add-sub button */}
                      {onAddSub && !isAdding && (
                        <button
                          type="button"
                          onClick={() => {
                            resetAddForm();
                            setAddingForTrade(trade);
                          }}
                          className="inline-flex items-center justify-center w-7 h-7 rounded border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-colors text-sm font-bold"
                          title={`Add sub-contractor to ${trade}`}
                        >
                          +
                        </button>
                      )}
                    </div>

                    {/* Inline add-sub form */}
                    {onAddSub && isAdding && (
                      <div className="mt-2 p-3 border border-blue-200 rounded-lg bg-blue-50/50 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Name</label>
                            <input
                              type="text"
                              value={newSubName}
                              onChange={(e) => setNewSubName(e.target.value)}
                              placeholder="Company name"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Abbreviation (2 letters)</label>
                            <input
                              type="text"
                              maxLength={2}
                              value={newSubAbbrev}
                              onChange={(e) => setNewSubAbbrev(e.target.value.toUpperCase())}
                              placeholder="AB"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Color</label>
                          <div className="flex flex-wrap gap-1">
                            {PRESET_COLORS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setNewSubColor(c)}
                                className={clsx(
                                  'w-5 h-5 rounded-full border-2 transition-transform',
                                  newSubColor === c ? 'border-gray-800 scale-125' : 'border-transparent hover:scale-110'
                                )}
                                style={{ backgroundColor: c }}
                                title={c}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-gray-600 mb-0.5">Trade</label>
                          <input
                            type="text"
                            value={trade}
                            disabled
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-gray-100 text-gray-500"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={resetAddForm}
                            className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubmitNewSub(trade)}
                            disabled={!newSubName.trim() || newSubAbbrev.trim().length !== 2}
                            className={clsx(
                              'px-2 py-1 text-xs font-medium rounded transition-colors',
                              newSubName.trim() && newSubAbbrev.trim().length === 2
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-blue-300 text-white cursor-not-allowed'
                            )}
                          >
                            Add Sub
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
