'use client';

import type { VendorBid } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface VendorComparisonProps {
  bids: VendorBid[];
}

export function VendorComparison({ bids }: VendorComparisonProps) {
  // Determine max vendor columns
  const maxVendors = Math.max(...bids.map((b) => b.vendors.length));

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300 text-xs font-semibold text-gray-600 uppercase tracking-wide">
            <th className="px-3 py-2 min-w-[180px]">Scope Item</th>
            <th className="px-3 py-2 w-20">Cost Code</th>
            {Array.from({ length: maxVendors }, (_, i) => (
              <th key={i} className="px-3 py-2 w-32 text-right">Vendor {i + 1}</th>
            ))}
            <th className="px-3 py-2 w-24 text-right">Delta</th>
            <th className="px-3 py-2 min-w-[160px]">Notes</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="px-3 py-2 font-medium text-gray-800">{bid.scopeItem}</td>
              <td className="px-3 py-2 text-gray-500">{bid.costCode}</td>
              {bid.vendors.map((v, vi) => (
                <td
                  key={vi}
                  className={`px-3 py-2 text-right tabular-nums ${
                    v.recommended
                      ? 'bg-green-50 text-green-800 font-semibold'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="text-xs font-medium text-gray-500 mb-0.5">{v.name}</div>
                  <div>{formatCurrency(v.price)}</div>
                  {v.recommended && (
                    <span className="text-[10px] text-green-600 font-medium">Recommended</span>
                  )}
                </td>
              ))}
              {/* Fill empty vendor cells */}
              {Array.from({ length: maxVendors - bid.vendors.length }, (_, fi) => (
                <td key={`empty-${fi}`} className="px-3 py-2" />
              ))}
              <td className="px-3 py-2 text-right tabular-nums text-gray-600">
                {formatCurrency(bid.delta)}
              </td>
              <td className="px-3 py-2 text-xs text-gray-500">{bid.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
