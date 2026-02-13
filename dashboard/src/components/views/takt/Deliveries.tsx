'use client';

import { useState } from 'react';
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

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'] as const;

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
  const [deliveries, setDeliveries] = useState<Delivery[]>(SEED_DELIVERIES);
  const [showForm, setShowForm] = useState(false);
  const [formMaterial, setFormMaterial] = useState('');
  const [formSupplier, setFormSupplier] = useState('');
  const [formZone, setFormZone] = useState<string>(ZONES[0]);
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const addDelivery = () => {
    if (!formMaterial.trim() || !formSupplier.trim()) return;
    const delivery: Delivery = {
      id: `d${Date.now()}`,
      material: formMaterial.trim(),
      supplier: formSupplier.trim(),
      zone: formZone,
      scheduledDate: formDate || new Date().toISOString().slice(0, 10),
      scheduledTime: formTime || '07:00',
      status: 'scheduled',
      notes: formNotes.trim() || undefined,
    };
    setDeliveries((prev) => [delivery, ...prev]);
    setFormMaterial('');
    setFormSupplier('');
    setFormZone(ZONES[0]);
    setFormDate('');
    setFormTime('');
    setFormNotes('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">JIT Delivery Schedule</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Delivery'}
        </button>
      </div>

      {/* Quick add form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Material..."
              value={formMaterial}
              onChange={(e) => setFormMaterial(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Supplier..."
              value={formSupplier}
              onChange={(e) => setFormSupplier(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={formZone}
              onChange={(e) => setFormZone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="time"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Notes (optional)..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addDelivery}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['scheduled', 'in-transit', 'delivered', 'delayed'] as const).map((s) => {
          const count = deliveries.filter((d) => d.status === s).length;
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
              {deliveries.map((d) => (
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
