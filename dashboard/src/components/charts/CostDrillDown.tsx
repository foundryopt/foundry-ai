'use client';

import type { BudgetCategory } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface CostDrillDownProps {
  category: BudgetCategory;
  onClose: () => void;
}

export function CostDrillDown({ category, onClose }: CostDrillDownProps) {
  const utilization = category.current > 0 ? (category.spent / category.current) * 100 : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          {category.costCode} — {category.label}
        </h3>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">
          ✕ Close
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Metric label="Original" value={formatCurrency(category.original)} />
        <Metric label="Current" value={formatCurrency(category.current)} />
        <Metric label="Spent" value={formatCurrency(category.spent)} sub={`${utilization.toFixed(0)}%`} />
        <Metric label="Remaining" value={formatCurrency(category.remaining)} />
      </div>

      {category.potential > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-amber-800">
            Potential: {formatCurrency(category.potential)} from {category.linkedTaskIds.length} Open Task{category.linkedTaskIds.length > 1 ? 's' : ''}
          </p>
          <p className="text-[10px] text-amber-600 mt-0.5">
            Tasks: {category.linkedTaskIds.join(', ')}
          </p>
        </div>
      )}

      {category.linkedTaskIds.length > 0 && category.potential === 0 && (
        <p className="text-xs text-gray-400">
          Linked tasks: {category.linkedTaskIds.join(', ')} (no cost impact)
        </p>
      )}
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
      {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
    </div>
  );
}
