'use client';

import { useState } from 'react';
import clsx from 'clsx';

export interface Roadblock {
  id: string;
  description: string;
  zone: string;
  trade: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in-progress' | 'resolved';
  owner: string;
  created: string;
  resolved?: string;
}

interface RoadblocksProps {
  roadblocks: Roadblock[];
  onUpdate: (id: string, status: Roadblock['status']) => void;
  onAdd: () => void;
}

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
};

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  'in-progress': 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
};

export function Roadblocks({ roadblocks, onUpdate, onAdd }: RoadblocksProps) {
  const [filter, setFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all');

  const filtered = filter === 'all' ? roadblocks : roadblocks.filter((r) => r.status === filter);

  const counts = {
    all: roadblocks.length,
    open: roadblocks.filter((r) => r.status === 'open').length,
    'in-progress': roadblocks.filter((r) => r.status === 'in-progress').length,
    resolved: roadblocks.filter((r) => r.status === 'resolved').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Roadblocks</h3>
        <button
          onClick={onAdd}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          + Roadblock
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'open', 'in-progress', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors',
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Description</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Zone</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Trade</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Severity</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Owner</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((rb) => (
                <tr key={rb.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 max-w-xs truncate">{rb.description}</td>
                  <td className="px-4 py-3 text-gray-600">{rb.zone}</td>
                  <td className="px-4 py-3 text-gray-600">{rb.trade}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium capitalize', SEVERITY_BADGE[rb.severity])}>
                      {rb.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium capitalize', STATUS_BADGE[rb.status])}>
                      {rb.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{rb.owner}</td>
                  <td className="px-4 py-3">
                    {rb.status !== 'resolved' && (
                      <select
                        value={rb.status}
                        onChange={(e) => onUpdate(rb.id, e.target.value as Roadblock['status'])}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">
                    No roadblocks
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
