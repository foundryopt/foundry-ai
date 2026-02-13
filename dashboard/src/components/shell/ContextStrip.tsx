'use client';

import type { BudgetSummary, ScheduleSummary, QualitySummary, ViewTab } from '@/lib/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { useActiveView } from '@/hooks/useActiveView';

interface ContextStripProps {
  budget: BudgetSummary;
  schedule: ScheduleSummary;
  quality: QualitySummary;
}

export function ContextStrip({ budget, schedule, quality }: ContextStripProps) {
  const { setView } = useActiveView();

  const scheduleLabel =
    schedule.overallStatus === 'on-track'
      ? 'On Track'
      : schedule.overallStatus === 'at-risk'
        ? 'At Risk'
        : 'Behind';

  const scheduleColor =
    schedule.overallStatus === 'on-track'
      ? 'text-green-600'
      : schedule.overallStatus === 'at-risk'
        ? 'text-yellow-600'
        : 'text-red-600';

  const nav = (tab: ViewTab) => () => setView(tab);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-6 overflow-x-auto text-xs">
        {/* Budget → tab 4 */}
        <button onClick={nav(4)} className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
          <span className="text-gray-400 uppercase tracking-wider font-medium">Budget</span>
          <span className="font-semibold text-gray-700">
            {formatPercent(budget.percentSpent)} spent
          </span>
          <span className="text-gray-400">of {formatCurrency(budget.currentBudget)}</span>
          {budget.totalPotential > 0 && (
            <span className="text-amber-600 font-medium">
              +{formatCurrency(budget.totalPotential)} potential
            </span>
          )}
        </button>

        <div className="w-px h-4 bg-gray-200 shrink-0" />

        {/* Schedule → tab 11 (Takt Planning / Critical Path) */}
        <button onClick={nav(11)} className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
          <span className="text-gray-400 uppercase tracking-wider font-medium">Schedule</span>
          <span className={`font-semibold ${scheduleColor}`}>{scheduleLabel}</span>
          {schedule.phases.some((p) => p.daysVariance < 0) && (
            <span className="text-gray-400">
              {Math.abs(Math.min(...schedule.phases.map((p) => p.daysVariance)))}d behind
            </span>
          )}
        </button>

        <div className="w-px h-4 bg-gray-200 shrink-0" />

        {/* Quality → tab 5 */}
        <button onClick={nav(5)} className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
          <span className="text-gray-400 uppercase tracking-wider font-medium">Quality</span>
          <span className="font-semibold text-gray-700">
            {formatPercent(quality.percentCurrent)} current
          </span>
        </button>
        {quality.affectedByOpenTasks > 0 && (
          <button
            onClick={nav(0)}
            className="text-amber-600 font-medium hover:underline transition-colors shrink-0"
          >
            {quality.affectedByOpenTasks} affected by Open Tasks
          </button>
        )}
      </div>
    </div>
  );
}
