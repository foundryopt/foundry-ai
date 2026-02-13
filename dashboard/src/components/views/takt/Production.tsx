'use client';

import { useState } from 'react';
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

const STATUS_OPTIONS: ProductionEntry['status'][] = ['not-started', 'in-progress', 'complete', 'blocked'];

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];

export function Production() {
  const [entries, setEntries] = useState<ProductionEntry[]>(SEED_PRODUCTION);
  const [showForm, setShowForm] = useState(false);
  const [formZone, setFormZone] = useState(ZONES[0]);
  const [formTrade, setFormTrade] = useState('');
  const [formScope, setFormScope] = useState('');
  const [formPlanned, setFormPlanned] = useState('');

  const statsByZone = ZONES.map((zone) => {
    const items = entries.filter((p) => p.zone === zone);
    const avgPct = items.length > 0 ? Math.round(items.reduce((s, p) => s + p.pctComplete, 0) / items.length) : 0;
    return { zone, total: items.length, complete: items.filter((p) => p.status === 'complete').length, avgPct };
  });

  const handleAdd = () => {
    if (!formTrade.trim() || !formScope.trim() || !formPlanned) return;
    const newEntry: ProductionEntry = {
      id: `pr${Date.now()}`,
      zone: formZone,
      trade: formTrade.trim(),
      scope: formScope.trim(),
      planned: formPlanned,
      actual: '',
      status: 'not-started',
      pctComplete: 0,
    };
    setEntries((prev) => [...prev, newEntry]);
    setFormTrade('');
    setFormScope('');
    setFormPlanned('');
    setShowForm(false);
  };

  const handleStatusChange = (id: string, newStatus: ProductionEntry['status']) => {
    setEntries((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const handlePctChange = (id: string, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setEntries((prev) =>
      prev.map((p) => (p.id === id ? { ...p, pctComplete: clamped } : p))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Production Tracking</h3>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Entry'}
        </button>
      </div>

      {/* Inline add form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Zone</label>
              <select
                value={formZone}
                onChange={(e) => setFormZone(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ZONES.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Trade</label>
              <input
                type="text"
                value={formTrade}
                onChange={(e) => setFormTrade(e.target.value)}
                placeholder="e.g. Framing"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Scope</label>
              <input
                type="text"
                value={formScope}
                onChange={(e) => setFormScope(e.target.value)}
                placeholder="e.g. Interior walls Level 2"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Planned Date</label>
              <input
                type="date"
                value={formPlanned}
                onChange={(e) => setFormPlanned(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleAdd}
              disabled={!formTrade.trim() || !formScope.trim() || !formPlanned}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Entry
            </button>
          </div>
        </div>
      )}

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
              {entries.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.zone}</td>
                  <td className="px-4 py-3 text-gray-700">{p.trade}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.scope}</td>
                  <td className="px-4 py-3 text-gray-600">{p.planned}</td>
                  <td className="px-4 py-3 text-gray-600">{p.actual || '\u2014'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value as ProductionEntry['status'])}
                      className={clsx(
                        'text-xs font-medium capitalize rounded-lg px-2 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500',
                        STATUS_BADGE[p.status]
                      )}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            'h-full rounded-full transition-all',
                            p.pctComplete === 100 ? 'bg-green-500' : p.pctComplete > 0 ? 'bg-blue-500' : 'bg-gray-300'
                          )}
                          style={{ width: `${p.pctComplete}%` }}
                        />
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={p.pctComplete}
                        onChange={(e) => handlePctChange(p.id, parseInt(e.target.value, 10) || 0)}
                        className="w-14 text-xs text-gray-700 border border-gray-300 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500">%</span>
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
