'use client';

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
  const statusCounts = SEED_PERMITS.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Permit Tracker</h3>

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
              {SEED_PERMITS.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{p.type}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{p.description}</td>
                  <td className="px-4 py-3 text-gray-600">{p.zone}</td>
                  <td className="px-4 py-3 text-gray-600">{p.submittedDate}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium capitalize', STATUS_BADGE[p.status])}>
                      {p.status}
                    </span>
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
