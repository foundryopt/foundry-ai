'use client';

import clsx from 'clsx';
import type { BoardTask } from '@/lib/types';
import { CategoryTag } from '@/components/ui/CategoryTag';
import { formatDate } from '@/lib/utils';

interface TaskCardProps {
  task: BoardTask;
  isDragging?: boolean;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
  onDelete: (taskId: string) => void;
}

function getDueLabel(slaDate: string): { text: string; tone: 'overdue' | 'soon' | 'ok' } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sla = new Date(slaDate);
  sla.setHours(0, 0, 0, 0);
  const diff = Math.round((sla.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, tone: 'overdue' };
  if (diff === 0) return { text: 'Due today', tone: 'soon' };
  if (diff <= 3) return { text: `${diff}d left`, tone: 'soon' };
  return { text: formatDate(slaDate), tone: 'ok' };
}

export function TaskCard({ task, isDragging, onDragStart, onDragEnd, onDelete }: TaskCardProps) {
  const due = getDueLabel(task.slaDate);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={clsx(
        'group bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all',
        'hover:border-blue-300 hover:shadow-md',
        isDragging && 'opacity-50 rotate-1',
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <CategoryTag category={task.category} />
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs leading-none transition-opacity"
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>

      <p className="text-sm font-medium text-gray-900 leading-snug mb-2">
        {task.subject}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="truncate" title={task.owner}>{task.owner}</span>
        <span
          className={clsx(
            'shrink-0 ml-2 px-2 py-0.5 rounded-full font-medium',
            due.tone === 'overdue' && 'bg-red-50 text-red-700',
            due.tone === 'soon' && 'bg-yellow-50 text-yellow-700',
            due.tone === 'ok' && 'bg-gray-50 text-gray-600',
          )}
        >
          {due.text}
        </span>
      </div>

      {(task.costImpact || task.scheduleImpactDays) && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex gap-3 text-[11px] text-gray-500">
          {task.costImpact ? (
            <span>${(task.costImpact / 1000).toFixed(0)}k cost</span>
          ) : null}
          {task.scheduleImpactDays ? (
            <span>{task.scheduleImpactDays}d schedule</span>
          ) : null}
          {task.costCodeRef ? <span>CC {task.costCodeRef}</span> : null}
        </div>
      )}
    </div>
  );
}
