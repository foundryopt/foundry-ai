'use client';

import type { SchedulePhase } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface TimeDrillDownProps {
  phase: SchedulePhase;
  onClose: () => void;
}

export function TimeDrillDown({ phase, onClose }: TimeDrillDownProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{phase.name}</h3>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">
          ✕ Close
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Metric label="Start" value={formatDate(phase.startDate)} />
        <Metric label="End" value={formatDate(phase.endDate)} />
        <Metric label="Complete" value={`${phase.percentComplete}%`} />
        <Metric
          label="Variance"
          value={`${phase.daysVariance > 0 ? '+' : ''}${phase.daysVariance}d`}
          color={
            phase.daysVariance < 0
              ? 'text-red-600'
              : phase.daysVariance > 0
                ? 'text-green-600'
                : 'text-gray-700'
          }
        />
      </div>

      {phase.potentialImpactDays > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-amber-800">
            Potential impact: +{phase.potentialImpactDays}d from {phase.linkedTaskIds.length} Open Task{phase.linkedTaskIds.length > 1 ? 's' : ''}
          </p>
          <p className="text-[10px] text-amber-600 mt-0.5">
            Tasks: {phase.linkedTaskIds.join(', ')}
          </p>
        </div>
      )}

      {phase.linkedTaskIds.length > 0 && phase.potentialImpactDays === 0 && (
        <p className="text-xs text-gray-400">
          Linked tasks: {phase.linkedTaskIds.join(', ')}
        </p>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  color = 'text-gray-900',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-semibold ${color}`}>{value}</p>
    </div>
  );
}
