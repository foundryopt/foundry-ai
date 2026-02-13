'use client';

import clsx from 'clsx';

interface PPCWeek {
  week: string;
  planned: number;
  completed: number;
}

const SEED_PPC: PPCWeek[] = [
  { week: 'W1 (Jan 27)', planned: 24, completed: 20 },
  { week: 'W2 (Feb 3)', planned: 28, completed: 25 },
  { week: 'W3 (Feb 10)', planned: 26, completed: 24 },
  { week: 'W4 (Feb 17)', planned: 30, completed: 22 },
  { week: 'W5 (Feb 24)', planned: 32, completed: 30 },
  { week: 'W6 (Mar 3)', planned: 28, completed: 27 },
];

export function PPCMetrics() {
  const overall = SEED_PPC.reduce(
    (acc, w) => ({ planned: acc.planned + w.planned, completed: acc.completed + w.completed }),
    { planned: 0, completed: 0 }
  );
  const overallPPC = Math.round((overall.completed / overall.planned) * 100);
  const maxPlanned = Math.max(...SEED_PPC.map((w) => w.planned));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Percent Plan Complete (PPC)</h3>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{overallPPC}%</div>
          <div className="text-xs text-gray-500 mt-1">Overall PPC</div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{overall.completed}</div>
          <div className="text-xs text-gray-500 mt-1">Tasks Completed</div>
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{overall.planned}</div>
          <div className="text-xs text-gray-500 mt-1">Tasks Planned</div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Weekly PPC Trend</h4>
        <div className="space-y-3">
          {SEED_PPC.map((w) => {
            const ppc = Math.round((w.completed / w.planned) * 100);
            const barWidth = (w.completed / maxPlanned) * 100;
            const plannedWidth = (w.planned / maxPlanned) * 100;
            return (
              <div key={w.week} className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-600 text-right shrink-0">{w.week}</div>
                <div className="flex-1 relative">
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden relative">
                    {/* Planned bar (background) */}
                    <div
                      className="absolute inset-y-0 left-0 bg-gray-200 rounded-full"
                      style={{ width: `${plannedWidth}%` }}
                    />
                    {/* Completed bar */}
                    <div
                      className={clsx(
                        'absolute inset-y-0 left-0 rounded-full transition-all',
                        ppc >= 85 ? 'bg-green-500' : ppc >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      )}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right shrink-0">
                  <span
                    className={clsx(
                      'text-sm font-semibold',
                      ppc >= 85 ? 'text-green-600' : ppc >= 70 ? 'text-yellow-600' : 'text-red-600'
                    )}
                  >
                    {ppc}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-gray-200 inline-block" /> Planned
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Completed ≥85%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" /> 70–84%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> &lt;70%
          </span>
        </div>
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 font-semibold text-gray-600">Week</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-600">Planned</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-600">Completed</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-600">PPC</th>
              <th className="text-right px-4 py-2 font-semibold text-gray-600">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {SEED_PPC.map((w) => {
              const ppc = Math.round((w.completed / w.planned) * 100);
              const variance = w.completed - w.planned;
              return (
                <tr key={w.week} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800">{w.week}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{w.planned}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{w.completed}</td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className={clsx(
                        'font-semibold',
                        ppc >= 85 ? 'text-green-600' : ppc >= 70 ? 'text-yellow-600' : 'text-red-600'
                      )}
                    >
                      {ppc}%
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className={clsx('font-medium', variance >= 0 ? 'text-green-600' : 'text-red-600')}>
                      {variance >= 0 ? '+' : ''}{variance}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
