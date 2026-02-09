'use client';

import type { QualitySummary } from '@/lib/types';

interface QualityDrillDownProps {
  quality: QualitySummary;
  selectedType: string;
  onClose: () => void;
}

export function QualityDrillDown({ quality, selectedType, onClose }: QualityDrillDownProps) {
  const dt = quality.byType.find((t) => t.type === selectedType);
  if (!dt) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{dt.type}s</h3>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">
          ✕ Close
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Total" value={String(dt.total)} />
        <Metric label="Current" value={String(dt.current)} color="text-green-600" />
        <Metric label="Pending Review" value={String(dt.pendingReview)} color="text-blue-600" />
        <Metric label="Revision Needed" value={String(dt.revisionNeeded)} color="text-yellow-600" />
      </div>

      {dt.affectedByOpenTask > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
          <p className="text-xs font-medium text-amber-800">
            {dt.affectedByOpenTask} {dt.type.toLowerCase()}{dt.affectedByOpenTask > 1 ? 's' : ''} affected by Open Tasks
          </p>
        </div>
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
