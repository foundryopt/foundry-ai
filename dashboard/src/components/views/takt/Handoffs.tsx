'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface HandoffItem {
  id: string;
  zone: string;
  fromTrade: string;
  toTrade: string;
  date: string;
  punchComplete: boolean;
  cleanComplete: boolean;
  photoUploaded: boolean;
  signedOff: boolean;
}

const SEED_HANDOFFS: HandoffItem[] = [
  { id: 'ho1', zone: 'Zone A', fromTrade: 'Framing', toTrade: 'Plumbing', date: '2026-02-10', punchComplete: true, cleanComplete: true, photoUploaded: true, signedOff: true },
  { id: 'ho2', zone: 'Zone A', fromTrade: 'Plumbing', toTrade: 'Electrical', date: '2026-02-12', punchComplete: true, cleanComplete: true, photoUploaded: false, signedOff: false },
  { id: 'ho3', zone: 'Zone B', fromTrade: 'Framing', toTrade: 'Plumbing', date: '2026-02-11', punchComplete: true, cleanComplete: false, photoUploaded: false, signedOff: false },
  { id: 'ho4', zone: 'Zone B', fromTrade: 'Plumbing', toTrade: 'Electrical', date: '2026-02-13', punchComplete: false, cleanComplete: false, photoUploaded: false, signedOff: false },
  { id: 'ho5', zone: 'Zone C', fromTrade: 'Framing', toTrade: 'Plumbing', date: '2026-02-12', punchComplete: true, cleanComplete: true, photoUploaded: true, signedOff: false },
  { id: 'ho6', zone: 'Zone D', fromTrade: 'Framing', toTrade: 'Plumbing', date: '2026-02-13', punchComplete: false, cleanComplete: false, photoUploaded: false, signedOff: false },
];

function CheckIcon({ checked }: { checked: boolean }) {
  return checked ? (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
  ) : (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  );
}

export function Handoffs() {
  const [handoffs, setHandoffs] = useState(SEED_HANDOFFS);

  const toggleCheck = (id: string, field: 'punchComplete' | 'cleanComplete' | 'photoUploaded' | 'signedOff') => {
    setHandoffs((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: !h[field] } : h))
    );
  };

  const completionPct = (h: HandoffItem) => {
    const checks = [h.punchComplete, h.cleanComplete, h.photoUploaded, h.signedOff];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Zone Handoff Checklists</h3>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Zone</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">From</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">To</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Date</th>
                <th className="text-center px-4 py-2 font-semibold text-gray-600">Punch</th>
                <th className="text-center px-4 py-2 font-semibold text-gray-600">Clean</th>
                <th className="text-center px-4 py-2 font-semibold text-gray-600">Photo</th>
                <th className="text-center px-4 py-2 font-semibold text-gray-600">Sign-off</th>
                <th className="text-center px-4 py-2 font-semibold text-gray-600">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {handoffs.map((h) => {
                const pct = completionPct(h);
                return (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{h.zone}</td>
                    <td className="px-4 py-3 text-gray-600">{h.fromTrade}</td>
                    <td className="px-4 py-3 text-gray-600">{h.toTrade}</td>
                    <td className="px-4 py-3 text-gray-600">{h.date}</td>
                    <td className="px-4 py-3 text-center cursor-pointer" onClick={() => toggleCheck(h.id, 'punchComplete')}>
                      <CheckIcon checked={h.punchComplete} />
                    </td>
                    <td className="px-4 py-3 text-center cursor-pointer" onClick={() => toggleCheck(h.id, 'cleanComplete')}>
                      <CheckIcon checked={h.cleanComplete} />
                    </td>
                    <td className="px-4 py-3 text-center cursor-pointer" onClick={() => toggleCheck(h.id, 'photoUploaded')}>
                      <CheckIcon checked={h.photoUploaded} />
                    </td>
                    <td className="px-4 py-3 text-center cursor-pointer" onClick={() => toggleCheck(h.id, 'signedOff')}>
                      <CheckIcon checked={h.signedOff} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={clsx(
                              'h-full rounded-full transition-all',
                              pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-400'
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
