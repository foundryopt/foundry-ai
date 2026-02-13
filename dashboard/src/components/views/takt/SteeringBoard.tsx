'use client';

import React from 'react';
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
  status: 'planned' | 'active' | 'done' | 'blocked';
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
  onAddMilestone: () => void;
}

const STATUS_COLORS: Record<TaktTask['status'], string> = {
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
  onAddMilestone,
}: SteeringBoardProps) {
  const dayHeaders = Array.from({ length: days }, (_, i) => i + 1);

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
        <button
          onClick={onAddMilestone}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          + Milestone
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <span key={status} className={clsx('px-2 py-0.5 rounded border', cls)}>
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

      {/* Sub-contractor legend */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Sub-Contractors</h4>
        <div className="flex flex-wrap gap-2">
          {subs.map((s) => (
            <span
              key={s.abbrev}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border"
              style={{ borderColor: s.color, backgroundColor: `${s.color}15`, color: s.color }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              {s.abbrev} — {s.trade}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
