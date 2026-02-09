'use client';

import clsx from 'clsx';
import type { OpenTask } from '@/lib/types';
import { URGENCY_COLORS } from '@/lib/constants';
import { formatUrgencyLabel, formatCurrency } from '@/lib/utils';
import { CategoryTag } from '@/components/ui/CategoryTag';

interface TaskCardProps {
  task: OpenTask;
  onSelect: (taskId: string) => void;
}

export function TaskCard({ task, onSelect }: TaskCardProps) {
  const colors = URGENCY_COLORS[task.urgency];

  return (
    <button
      onClick={() => onSelect(task.id)}
      className={clsx(
        'w-full text-left bg-white rounded-lg border-l-4 p-4 shadow-sm hover:shadow-md transition-shadow',
        colors.border,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CategoryTag category={task.category} />
            <span className="text-xs font-mono text-gray-400">{task.id}</span>
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">{task.subject}</p>
          <p className="text-xs text-gray-500 mt-1">{task.owner}</p>
        </div>
        <div className="text-right shrink-0">
          <span className={clsx('text-xs font-semibold', colors.text)}>
            {formatUrgencyLabel(task.urgency, task.daysOverdue, task.daysUntilDue)}
          </span>
          {task.costImpact !== undefined && task.costImpact !== 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(task.costImpact)}</p>
          )}
        </div>
      </div>

      {/* Deep link count indicator */}
      <div className="flex items-center gap-1 mt-2">
        {task.deepLinks.slice(0, 3).map((link) => (
          <span
            key={link.target}
            className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
          >
            {link.target}
          </span>
        ))}
        {task.deepLinks.length > 3 && (
          <span className="text-[10px] text-gray-400">+{task.deepLinks.length - 3}</span>
        )}
      </div>
    </button>
  );
}
