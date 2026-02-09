import type { OpenTask } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface DetailTimelineProps {
  task: OpenTask;
}

export function DetailTimeline({ task }: DetailTimelineProps) {
  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
        Timeline
      </h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-400">Created</span>
          <p className="font-medium text-gray-700">{formatDate(task.createdDate)}</p>
        </div>
        <div>
          <span className="text-gray-400">SLA Date</span>
          <p className="font-medium text-gray-700">{formatDate(task.slaDate)}</p>
        </div>
        <div>
          <span className="text-gray-400">Source</span>
          <p className="font-medium text-gray-700">{task.source}</p>
        </div>
        {task.costImpact !== undefined && task.costImpact !== 0 && (
          <div>
            <span className="text-gray-400">Cost Impact</span>
            <p className="font-medium text-gray-700">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(task.costImpact)}
            </p>
          </div>
        )}
        {task.scheduleImpactDays !== undefined && task.scheduleImpactDays > 0 && (
          <div>
            <span className="text-gray-400">Schedule Impact</span>
            <p className="font-medium text-gray-700">{task.scheduleImpactDays}d</p>
          </div>
        )}
      </div>
    </div>
  );
}
