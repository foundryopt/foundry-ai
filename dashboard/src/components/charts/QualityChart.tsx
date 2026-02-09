'use client';

import type { QualitySummary } from '@/lib/types';

interface QualityChartProps {
  quality: QualitySummary;
  onSelectType: (type: string) => void;
}

export function QualityChart({ quality, onSelectType }: QualityChartProps) {
  return (
    <div className="space-y-3">
      {quality.byType.map((dt) => {
        const currentPct = (dt.current / dt.total) * 100;
        const pendingPct = (dt.pendingReview / dt.total) * 100;
        const revisionPct = (dt.revisionNeeded / dt.total) * 100;
        const affectedPct = (dt.affectedByOpenTask / dt.total) * 100;

        return (
          <button
            key={dt.type}
            onClick={() => onSelectType(dt.type)}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {dt.type}s
              </span>
              <span className="text-xs text-gray-500">
                {dt.current}/{dt.total} current
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
              <div
                className="h-full bg-green-500"
                style={{ width: `${currentPct}%` }}
                title={`${dt.current} current`}
              />
              <div
                className="h-full bg-blue-400"
                style={{ width: `${pendingPct}%` }}
                title={`${dt.pendingReview} pending review`}
              />
              <div
                className="h-full bg-yellow-500"
                style={{ width: `${revisionPct}%` }}
                title={`${dt.revisionNeeded} revision needed`}
              />
              <div
                className="h-full pattern-potential"
                style={{ width: `${affectedPct}%` }}
                title={`${dt.affectedByOpenTask} affected by Open Tasks`}
              />
            </div>
            {dt.affectedByOpenTask > 0 && (
              <p className="text-[10px] text-amber-600 mt-0.5">
                {dt.affectedByOpenTask} affected by Open Tasks
              </p>
            )}
          </button>
        );
      })}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Current
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-400" /> Pending Review
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500" /> Revision Needed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Affected by Open Task
        </span>
      </div>
    </div>
  );
}
