import type { OpenTask } from '@/lib/types';
import { URGENCY_COLORS } from '@/lib/constants';
import { formatUrgencyLabel } from '@/lib/utils';
import { CategoryTag } from '@/components/ui/CategoryTag';
import { Badge } from '@/components/ui/Badge';
import clsx from 'clsx';

interface DetailHeaderProps {
  task: OpenTask;
  onClose: () => void;
}

export function DetailHeader({ task, onClose }: DetailHeaderProps) {
  const colors = URGENCY_COLORS[task.urgency];

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CategoryTag category={task.category} />
            <span className="text-xs font-mono text-gray-400">{task.id}</span>
            <Badge className={clsx(colors.bg, colors.text)}>
              {formatUrgencyLabel(task.urgency, task.daysOverdue, task.daysUntilDue)}
            </Badge>
          </div>
          <h2 className="text-base font-semibold text-gray-900">{task.subject}</h2>
          <p className="text-sm text-gray-500 mt-1">Owner: {task.owner}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 min-h-tap min-w-tap flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
