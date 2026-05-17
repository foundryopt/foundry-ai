'use client';

import { useState } from 'react';
import clsx from 'clsx';
import type { BoardStatus, BoardTask } from '@/lib/types';
import { TaskCard } from './TaskCard';

const COLUMN_ACCENT: Record<BoardStatus, string> = {
  todo: 'border-t-gray-400',
  'in-progress': 'border-t-blue-500',
  blocked: 'border-t-red-500',
  done: 'border-t-emerald-500',
};

const COLUMN_BADGE: Record<BoardStatus, string> = {
  todo: 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  blocked: 'bg-red-100 text-red-700',
  done: 'bg-emerald-100 text-emerald-700',
};

interface ColumnProps {
  status: BoardStatus;
  label: string;
  tasks: BoardTask[];
  draggingId: string | null;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
  onDrop: (status: BoardStatus) => void;
  onDelete: (taskId: string) => void;
  onAddInColumn: (status: BoardStatus) => void;
}

export function Column({
  status,
  label,
  tasks,
  draggingId,
  onDragStart,
  onDragEnd,
  onDrop,
  onDelete,
  onAddInColumn,
}: ColumnProps) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!isOver) setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={() => {
        setIsOver(false);
        onDrop(status);
      }}
      className={clsx(
        'flex-1 min-w-[260px] bg-gray-50 rounded-lg border-t-4 transition-colors',
        COLUMN_ACCENT[status],
        isOver && 'bg-blue-50 ring-2 ring-blue-300',
      )}
    >
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
          <span
            className={clsx(
              'inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 rounded-full text-xs font-medium',
              COLUMN_BADGE[status],
            )}
          >
            {tasks.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onAddInColumn(status)}
          className="text-gray-400 hover:text-blue-600 text-sm leading-none w-6 h-6 rounded hover:bg-white transition-colors"
          aria-label={`Add task to ${label}`}
          title={`Add task to ${label}`}
        >
          +
        </button>
      </div>

      <div className="p-2 space-y-2 min-h-[120px]">
        {tasks.length === 0 ? (
          <div className="text-center text-xs text-gray-400 py-6 select-none">
            Drop tasks here
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDragging={draggingId === task.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
