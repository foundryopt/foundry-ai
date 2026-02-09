'use client';

import type { BidMilestone, BidStatus } from '@/lib/types';

interface BidTimelineProps {
  milestones: BidMilestone[];
}

const STATUS_COLORS: Record<BidStatus, { dot: string; line: string }> = {
  completed: { dot: 'bg-green-500', line: 'bg-green-300' },
  'in-progress': { dot: 'bg-blue-500', line: 'bg-blue-200' },
  upcoming: { dot: 'bg-gray-300', line: 'bg-gray-200' },
};

export function BidTimeline({ milestones }: BidTimelineProps) {
  return (
    <div className="space-y-4">
      {milestones.map((bid) => (
        <div key={bid.id} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-800">{bid.bidPackage}</h4>
            <span className="text-xs text-gray-500">{bid.costCode}</span>
          </div>

          <div className="flex items-center gap-0">
            {bid.milestones.map((ms, i) => {
              const colors = STATUS_COLORS[ms.status];
              const isLast = i === bid.milestones.length - 1;
              return (
                <div key={i} className="flex items-center flex-1">
                  {/* Dot + label */}
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div className={`w-3.5 h-3.5 rounded-full ${colors.dot} ring-2 ring-white shadow-sm`} />
                    <span className="text-[10px] font-medium text-gray-700 mt-1 text-center leading-tight">
                      {ms.label}
                    </span>
                    <span className="text-[9px] text-gray-400 mt-0.5">{ms.date}</span>
                  </div>
                  {/* Connecting line */}
                  {!isLast && (
                    <div className={`flex-1 h-0.5 ${colors.line} -mx-1`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
