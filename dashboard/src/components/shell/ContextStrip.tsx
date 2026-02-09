'use client';

import { BUDGET, SCHEDULE, QUALITY } from '@/data';
import { formatCurrency, formatPercent } from '@/lib/utils';

export function ContextStrip() {
  const scheduleLabel =
    SCHEDULE.overallStatus === 'on-track'
      ? 'On Track'
      : SCHEDULE.overallStatus === 'at-risk'
        ? 'At Risk'
        : 'Behind';

  const scheduleColor =
    SCHEDULE.overallStatus === 'on-track'
      ? 'text-green-600'
      : SCHEDULE.overallStatus === 'at-risk'
        ? 'text-yellow-600'
        : 'text-red-600';

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-6 overflow-x-auto text-xs">
        {/* Budget */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-gray-400 uppercase tracking-wider font-medium">Budget</span>
          <span className="font-semibold text-gray-700">
            {formatPercent(BUDGET.percentSpent)} spent
          </span>
          <span className="text-gray-400">of {formatCurrency(BUDGET.currentBudget)}</span>
          {BUDGET.totalPotential > 0 && (
            <span className="text-amber-600 font-medium">
              +{formatCurrency(BUDGET.totalPotential)} potential
            </span>
          )}
        </div>

        <div className="w-px h-4 bg-gray-200 shrink-0" />

        {/* Schedule */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-gray-400 uppercase tracking-wider font-medium">Schedule</span>
          <span className={`font-semibold ${scheduleColor}`}>{scheduleLabel}</span>
          {SCHEDULE.phases.some((p) => p.daysVariance < 0) && (
            <span className="text-gray-400">
              {Math.abs(Math.min(...SCHEDULE.phases.map((p) => p.daysVariance)))}d behind
            </span>
          )}
        </div>

        <div className="w-px h-4 bg-gray-200 shrink-0" />

        {/* Quality */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-gray-400 uppercase tracking-wider font-medium">Quality</span>
          <span className="font-semibold text-gray-700">
            {formatPercent(QUALITY.percentCurrent)} current
          </span>
          {QUALITY.affectedByOpenTasks > 0 && (
            <span className="text-amber-600 font-medium">
              {QUALITY.affectedByOpenTasks} affected by Open Tasks
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
