'use client';

import type { SchedulePhase } from '@/lib/types';
import clsx from 'clsx';

interface TimeChartProps {
  phases: SchedulePhase[];
  onSelectPhase: (phaseId: string) => void;
}

export function TimeChart({ phases, onSelectPhase }: TimeChartProps) {
  return (
    <div className="space-y-3">
      {phases.map((phase) => {
        const isActive = phase.percentComplete > 0 && phase.percentComplete < 100;
        const statusColor =
          phase.daysVariance < -2
            ? 'bg-red-500'
            : phase.daysVariance < 0
              ? 'bg-yellow-500'
              : 'bg-green-500';

        return (
          <button
            key={phase.id}
            onClick={() => onSelectPhase(phase.id)}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <span className={clsx('text-sm', isActive ? 'font-semibold text-gray-900' : 'text-gray-600')}>
                {phase.name}
              </span>
              <span className="text-xs text-gray-500">
                {phase.percentComplete}%
                {phase.daysVariance !== 0 && (
                  <span
                    className={
                      phase.daysVariance < 0 ? 'text-red-600 ml-1' : 'text-green-600 ml-1'
                    }
                  >
                    ({phase.daysVariance > 0 ? '+' : ''}{phase.daysVariance}d)
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex">
              <div
                className={clsx('h-full rounded-l-full', statusColor)}
                style={{ width: `${phase.percentComplete}%` }}
              />
              {phase.potentialImpactDays > 0 && (
                <div
                  className="h-full pattern-potential"
                  style={{
                    width: `${Math.min(
                      100 - phase.percentComplete,
                      (phase.potentialImpactDays / 90) * 100,
                    )}%`,
                  }}
                />
              )}
            </div>
            {phase.linkedTaskIds.length > 0 && (
              <p className="text-[10px] text-amber-600 mt-0.5">
                {phase.linkedTaskIds.length} Open Task{phase.linkedTaskIds.length > 1 ? 's' : ''} linked
                {phase.potentialImpactDays > 0 &&
                  ` · +${phase.potentialImpactDays}d potential impact`}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}
