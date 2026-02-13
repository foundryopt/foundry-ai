'use client';

import clsx from 'clsx';

interface Delivery {
  id: string;
  material: string;
  supplier: string;
  zone: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'in-transit' | 'delivered' | 'delayed';
  notes?: string;
}

const SEED_DELIVERIES: Delivery[] = [
  { id: 'd1', material: 'Drywall Sheets (4×8)', supplier: 'ABC Supply', zone: 'Zone A', scheduledDate: '2026-02-13', scheduledTime: '07:00', status: 'delivered' },
  { id: 'd2', material: 'Copper Pipe Bundle', supplier: 'Ferguson', zone: 'Zone B', scheduledDate: '2026-02-13', scheduledTime: '08:30', status: 'in-transit', notes: 'ETA 09:15' },
  { id: 'd3', material: 'HVAC Ductwork', supplier: 'Carrier Direct', zone: 'Zone A', scheduledDate: '2026-02-13', scheduledTime: '10:00', status: 'scheduled' },
  { id: 'd4', material: 'Electrical Panel', supplier: 'Graybar', zone: 'Zone C', scheduledDate: '2026-02-14', scheduledTime: '07:00', status: 'scheduled' },
  { id: 'd5', material: 'Concrete Mix (40 yd³)', supplier: 'Vulcan Materials', zone: 'Zone D', scheduledDate: '2026-02-14', scheduledTime: '06:00', status: 'scheduled' },
  { id: 'd6', material: 'Fire Sprinkler Heads', supplier: 'Tyco', zone: 'Zone B', scheduledDate: '2026-02-12', scheduledTime: '09:00', status: 'delayed', notes: 'Backordered — new ETA 2/15' },
  { id: 'd7', material: 'Insulation Batts R-19', supplier: 'Owens Corning', zone: 'Zone C', scheduledDate: '2026-02-13', scheduledTime: '11:00', status: 'delivered' },
  { id: 'd8', material: 'Steel Studs (20 ga)', supplier: 'ClarkDietrich', zone: 'Zone D', scheduledDate: '2026-02-15', scheduledTime: '07:30', status: 'scheduled' },
];

const STATUS_BADGE: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  'in-transit': 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-green-100 text-green-700',
  delayed: 'bg-red-100 text-red-700',
};

export function Deliveries() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">JIT Delivery Schedule</h3>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['scheduled', 'in-transit', 'delivered', 'delayed'] as const).map((s) => {
          const count = SEED_DELIVERIES.filter((d) => d.status === s).length;
          return (
            <div key={s} className="bg-white rounded-lg shadow border border-gray-200 p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className={clsx('text-xs font-medium capitalize mt-1', STATUS_BADGE[s].replace(/bg-\S+/, ''))}>
                {s}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Material</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Supplier</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Zone</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Time</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {SEED_DELIVERIES.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{d.material}</td>
                  <td className="px-4 py-3 text-gray-600">{d.supplier}</td>
                  <td className="px-4 py-3 text-gray-600">{d.zone}</td>
                  <td className="px-4 py-3 text-gray-600">{d.scheduledDate}</td>
                  <td className="px-4 py-3 text-gray-600">{d.scheduledTime}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium capitalize', STATUS_BADGE[d.status])}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{d.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
