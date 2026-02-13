'use client';

import clsx from 'clsx';

interface ProductionEntry {
  id: string;
  zone: string;
  trade: string;
  scope: string;
  planned: string;
  actual: string;
  status: 'not-started' | 'in-progress' | 'complete' | 'blocked';
  pctComplete: number;
}

const SEED_PRODUCTION: ProductionEntry[] = [
  { id: 'pr1', zone: 'Zone A', trade: 'Framing', scope: 'Interior walls Level 2', planned: '2026-02-10', actual: '2026-02-10', status: 'complete', pctComplete: 100 },
  { id: 'pr2', zone: 'Zone A', trade: 'Plumbing', scope: 'Rough-in stack & branches', planned: '2026-02-11', actual: '2026-02-11', status: 'complete', pctComplete: 100 },
  { id: 'pr3', zone: 'Zone A', trade: 'Electrical', scope: 'Rough-in conduit & boxes', planned: '2026-02-12', actual: '2026-02-12', status: 'in-progress', pctComplete: 75 },
  { id: 'pr4', zone: 'Zone A', trade: 'HVAC', scope: 'Ductwork main trunk', planned: '2026-02-13', actual: '', status: 'not-started', pctComplete: 0 },
  { id: 'pr5', zone: 'Zone B', trade: 'Framing', scope: 'Interior walls Level 2', planned: '2026-02-11', actual: '2026-02-11', status: 'complete', pctComplete: 100 },
  { id: 'pr6', zone: 'Zone B', trade: 'Plumbing', scope: 'Rough-in stack & branches', planned: '2026-02-12', actual: '2026-02-12', status: 'in-progress', pctComplete: 60 },
  { id: 'pr7', zone: 'Zone B', trade: 'Electrical', scope: 'Rough-in conduit & boxes', planned: '2026-02-13', actual: '', status: 'not-started', pctComplete: 0 },
  { id: 'pr8', zone: 'Zone C', trade: 'Framing', scope: 'Interior walls Level 2', planned: '2026-02-12', actual: '2026-02-12', status: 'in-progress', pctComplete: 85 },
  { id: 'pr9', zone: 'Zone C', trade: 'Plumbing', scope: 'Rough-in stack & branches', planned: '2026-02-13', actual: '', status: 'blocked', pctComplete: 0 },
  { id: 'pr10', zone: 'Zone D', trade: 'Framing', scope: 'Interior walls Level 2', planned: '2026-02-13', actual: '2026-02-13', status: 'in-progress', pctComplete: 30 },
];

const STATUS_BADGE: Record<string, string> = {
  'not-started': 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  complete: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
};

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];

export function Production() {
  const statsByZone = ZONES.map((zone) => {
    const items = SEED_PRODUCTION.filter((p) => p.zone === zone);
    const avgPct = items.length > 0 ? Math.round(items.reduce((s, p) => s + p.pctComplete, 0) / items.length) : 0;
    return { zone, total: items.length, complete: items.filter((p) => p.status === 'complete').length, avgPct };
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Production Tracking</h3>

      {/* Zone summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsByZone.map((z) => (
          <div key={z.zone} className="bg-white rounded-lg shadow border border-gray-200 p-3">
            <div className="text-sm font-semibold text-gray-800">{z.zone}</div>
            <div className="mt-1 flex items-end gap-1">
              <span className="text-2xl font-bold text-gray-900">{z.avgPct}%</span>
              <span className="text-xs text-gray-500 mb-1">avg</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div
                className={clsx(
                  'h-full rounded-full',
                  z.avgPct === 100 ? 'bg-green-500' : z.avgPct >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                )}
                style={{ width: `${z.avgPct}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {z.complete}/{z.total} trades complete
            </div>
          </div>
        ))}
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Zone</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Trade</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Scope</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Planned</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Actual</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SEED_PRODUCTION.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.zone}</td>
                  <td className="px-4 py-3 text-gray-700">{p.trade}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.scope}</td>
                  <td className="px-4 py-3 text-gray-600">{p.planned}</td>
                  <td className="px-4 py-3 text-gray-600">{p.actual || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium capitalize', STATUS_BADGE[p.status])}>
                      {p.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full',
                            p.pctComplete === 100 ? 'bg-green-500' : p.pctComplete > 0 ? 'bg-blue-500' : 'bg-gray-300'
                          )}
                          style={{ width: `${p.pctComplete}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{p.pctComplete}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
