'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface Permit {
  id: string;
  type: string;
  description: string;
  zone: string;
  submittedDate: string;
  status: 'draft' | 'submitted' | 'in-review' | 'approved' | 'rejected' | 'expired';
  reviewer: string;
  expiresDate?: string;
}

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'] as const;

const PERMIT_TYPES = [
  'Hot Work',
  'Excavation',
  'Electrical',
  'Plumbing',
  'Confined Space',
  'Crane',
  'Building',
] as const;

const STATUSES = ['draft', 'submitted', 'in-review', 'approved', 'rejected', 'expired'] as const;

const SEED_PERMITS: Permit[] = [
  { id: 'p1', type: 'Hot Work', description: 'Welding on Level 2 steel beams', zone: 'Zone A', submittedDate: '2026-02-10', status: 'approved', reviewer: 'Fire Marshal', expiresDate: '2026-02-17' },
  { id: 'p2', type: 'Excavation', description: 'Foundation work south side', zone: 'Zone D', submittedDate: '2026-02-11', status: 'approved', reviewer: 'Safety Officer', expiresDate: '2026-02-25' },
  { id: 'p3', type: 'Electrical', description: 'Panel installation Zone B main switch', zone: 'Zone B', submittedDate: '2026-02-12', status: 'in-review', reviewer: 'Electrical Inspector' },
  { id: 'p4', type: 'Plumbing', description: 'Stack rough-in Zones A–C', zone: 'Zone A', submittedDate: '2026-02-12', status: 'submitted', reviewer: 'Plumbing Inspector' },
  { id: 'p5', type: 'Confined Space', description: 'Mechanical shaft work Level 1', zone: 'Zone C', submittedDate: '2026-02-09', status: 'approved', reviewer: 'Safety Officer', expiresDate: '2026-02-16' },
  { id: 'p6', type: 'Crane', description: 'Tower crane extension', zone: 'Zone D', submittedDate: '2026-02-08', status: 'expired', reviewer: 'Structural Eng.', expiresDate: '2026-02-12' },
  { id: 'p7', type: 'Hot Work', description: 'Torch cutting Zone C ductwork', zone: 'Zone C', submittedDate: '2026-02-13', status: 'draft', reviewer: 'Fire Marshal' },
  { id: 'p8', type: 'Building', description: 'Occupancy for Zone A common area', zone: 'Zone A', submittedDate: '2026-02-06', status: 'rejected', reviewer: 'Building Official' },
];

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  'in-review': 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
};

export function Permits() {
  const [permits, setPermits] = useState<Permit[]>(SEED_PERMITS);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<string>(PERMIT_TYPES[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formZone, setFormZone] = useState<string>(ZONES[0]);
  const [formReviewer, setFormReviewer] = useState('');
  const [formExpiresDate, setFormExpiresDate] = useState('');

  const addPermit = () => {
    if (!formDescription.trim() || !formReviewer.trim()) return;
    const permit: Permit = {
      id: `p${Date.now()}`,
      type: formType,
      description: formDescription.trim(),
      zone: formZone,
      submittedDate: new Date().toISOString().slice(0, 10),
      status: 'draft',
      reviewer: formReviewer.trim(),
      expiresDate: formExpiresDate || undefined,
    };
    setPermits((prev) => [permit, ...prev]);
    setFormType(PERMIT_TYPES[0]);
    setFormDescription('');
    setFormZone(ZONES[0]);
    setFormReviewer('');
    setFormExpiresDate('');
    setShowForm(false);
  };

  const updateStatus = (id: string, newStatus: Permit['status']) => {
    setPermits((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const statusCounts = permits.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Permit Tracker</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Permit'}
        </button>
      </div>

      {/* Quick add form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PERMIT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={formZone}
              onChange={(e) => setFormZone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Description..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Reviewer..."
              value={formReviewer}
              onChange={(e) => setFormReviewer(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              placeholder="Expires (optional)"
              value={formExpiresDate}
              onChange={(e) => setFormExpiresDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={addPermit}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <span
            key={status}
            className={clsx('px-3 py-1 rounded-full text-xs font-medium capitalize', STATUS_BADGE[status])}
          >
            {status}: {count}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Type</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Description</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Zone</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Submitted</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Reviewer</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Expires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {permits.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.type}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.description}</td>
                  <td className="px-4 py-3 text-gray-600">{p.zone}</td>
                  <td className="px-4 py-3 text-gray-600">{p.submittedDate}</td>
                  <td className="px-4 py-3">
                    <select
                      value={p.status}
                      onChange={(e) => updateStatus(p.id, e.target.value as Permit['status'])}
                      className={clsx(
                        'text-xs font-medium capitalize border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500',
                        STATUS_BADGE[p.status]
                      )}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.reviewer}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.expiresDate ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
