'use client';

import { useState } from 'react';
import type { VendorBid } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface VendorComparisonProps {
  bids: VendorBid[];
}

export function VendorComparison({ bids: initialBids }: VendorComparisonProps) {
  const [bids, setBids] = useState(initialBids);
  const [showForm, setShowForm] = useState(false);
  const [formScope, setFormScope] = useState('');
  const [formCostCode, setFormCostCode] = useState('');
  const [formBudget, setFormBudget] = useState('');
  const [formVendors, setFormVendors] = useState([
    { name: '', price: '' },
    { name: '', price: '' },
    { name: '', price: '' },
  ]);
  const [formNotes, setFormNotes] = useState('');

  const maxVendors = Math.max(...bids.map((b) => b.vendors.length), 3);

  const updateVendorField = (idx: number, field: 'name' | 'price', value: string) => {
    setFormVendors((prev) => prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };

  const addBid = () => {
    if (!formScope.trim()) return;
    const vendors = formVendors
      .filter((v) => v.name.trim() && v.price.trim())
      .map((v) => ({ name: v.name.trim(), price: Number(v.price) }));
    if (vendors.length === 0) return;

    const prices = vendors.map((v) => v.price);
    const newBid: VendorBid = {
      scopeItem: formScope.trim(),
      costCode: formCostCode.trim(),
      budget: formBudget ? Number(formBudget) : undefined,
      vendors,
      delta: Math.max(...prices) - Math.min(...prices),
      notes: formNotes.trim(),
    };
    setBids((prev) => [...prev, newBid]);
    setFormScope('');
    setFormCostCode('');
    setFormBudget('');
    setFormVendors([{ name: '', price: '' }, { name: '', price: '' }, { name: '', price: '' }]);
    setFormNotes('');
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <th className="px-3 py-2 min-w-[180px]">Scope Item</th>
              <th className="px-3 py-2 w-20">Cost Code</th>
              <th className="px-3 py-2 w-28 text-right">Budget</th>
              {Array.from({ length: maxVendors }, (_, i) => (
                <th key={i} className="px-3 py-2 w-32 text-right">Vendor {i + 1}</th>
              ))}
              <th className="px-3 py-2 w-24 text-right">Delta</th>
              <th className="px-3 py-2 min-w-[160px]">Notes</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid, i) => {
              const lowestPrice = Math.min(...bid.vendors.map((v) => v.price));
              return (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <td className="px-3 py-2 font-medium text-gray-800">{bid.scopeItem}</td>
                  <td className="px-3 py-2 text-gray-500">{bid.costCode}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-medium text-gray-700">
                    {bid.budget ? formatCurrency(bid.budget) : '—'}
                  </td>
                  {bid.vendors.map((v, vi) => {
                    const overBudget = bid.budget && v.price > bid.budget;
                    return (
                      <td
                        key={vi}
                        className={`px-3 py-2 text-right tabular-nums ${
                          v.recommended
                            ? 'bg-green-50 text-green-800 font-semibold'
                            : overBudget
                              ? 'text-red-600'
                              : 'text-gray-700'
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-500 mb-0.5">{v.name}</div>
                        <div>{formatCurrency(v.price)}</div>
                        {v.recommended && (
                          <span className="text-[10px] text-green-600 font-medium">Recommended</span>
                        )}
                        {bid.budget && (
                          <div className={`text-[10px] ${v.price <= bid.budget ? 'text-green-600' : 'text-red-500'}`}>
                            {v.price <= bid.budget ? `${formatCurrency(bid.budget - v.price)} under` : `${formatCurrency(v.price - bid.budget)} over`}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {Array.from({ length: maxVendors - bid.vendors.length }, (_, fi) => (
                    <td key={`empty-${fi}`} className="px-3 py-2" />
                  ))}
                  <td className="px-3 py-2 text-right tabular-nums text-gray-600">
                    {formatCurrency(bid.delta)}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-500">{bid.notes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add bid button / form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          + Add Bid
        </button>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">New Bid Entry</h4>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Scope item..."
              value={formScope}
              onChange={(e) => setFormScope(e.target.value)}
              className="col-span-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Cost code..."
              value={formCostCode}
              onChange={(e) => setFormCostCode(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Budget amount..."
              value={formBudget}
              onChange={(e) => setFormBudget(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-600">Vendors</span>
            {formVendors.map((v, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Vendor ${i + 1} name...`}
                  value={v.name}
                  onChange={(e) => updateVendorField(i, 'name', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Price..."
                  value={v.price}
                  onChange={(e) => updateVendorField(i, 'price', e.target.value)}
                  className="w-36 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Notes..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              onClick={addBid}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
