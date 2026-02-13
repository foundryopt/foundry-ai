'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface PlusDeltaEntry {
  id: string;
  type: 'plus' | 'delta';
  text: string;
  author: string;
  date: string;
  category: string;
}

const SEED_ENTRIES: PlusDeltaEntry[] = [
  { id: 'pd1', type: 'plus', text: 'Takt train stayed on schedule all week — no zone delays', author: 'J. Martinez', date: '2026-02-07', category: 'Schedule' },
  { id: 'pd2', type: 'plus', text: 'New material staging area reduced carry time by 20 min/zone', author: 'R. Patel', date: '2026-02-07', category: 'Logistics' },
  { id: 'pd3', type: 'delta', text: 'Handoff checklists not consistently completed — need accountability', author: 'S. Kim', date: '2026-02-07', category: 'Quality' },
  { id: 'pd4', type: 'delta', text: 'Morning huddle running over 15 min — tighten agenda', author: 'T. Johnson', date: '2026-02-07', category: 'Process' },
  { id: 'pd5', type: 'plus', text: 'Zero safety incidents for 3rd consecutive week', author: 'M. Chen', date: '2026-02-07', category: 'Safety' },
  { id: 'pd6', type: 'delta', text: 'HVAC sub needs earlier material staging — 2 hrs before zone start', author: 'L. Nguyen', date: '2026-02-07', category: 'Logistics' },
];

export function PlusDelta() {
  const [entries, setEntries] = useState<PlusDeltaEntry[]>(SEED_ENTRIES);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'plus' | 'delta'>('plus');
  const [formText, setFormText] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formCategory, setFormCategory] = useState('General');

  const addEntry = () => {
    if (!formText.trim()) return;
    const entry: PlusDeltaEntry = {
      id: `pd${Date.now()}`,
      type: formType,
      text: formText.trim(),
      author: formAuthor.trim() || 'Anonymous',
      date: new Date().toISOString().split('T')[0],
      category: formCategory,
    };
    setEntries((prev) => [entry, ...prev]);
    setFormText('');
    setFormAuthor('');
    setShowForm(false);
  };

  const plusEntries = entries.filter((e) => e.type === 'plus');
  const deltaEntries = entries.filter((e) => e.type === 'delta');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Plus / Delta</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFormType('plus')}
              className={clsx(
                'px-3 py-1 rounded text-xs font-medium transition-colors',
                formType === 'plus'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              + Plus
            </button>
            <button
              onClick={() => setFormType('delta')}
              className={clsx(
                'px-3 py-1 rounded text-xs font-medium transition-colors',
                formType === 'delta'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Δ Delta
            </button>
          </div>
          <input
            type="text"
            placeholder="What went well / what should change..."
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Author"
              value={formAuthor}
              onChange={(e) => setFormAuthor(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['General', 'Safety', 'Quality', 'Schedule', 'Logistics', 'Process'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={addEntry}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plus column */}
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <h4 className="text-sm font-semibold text-green-700 mb-3">+ Plus ({plusEntries.length})</h4>
          <div className="space-y-2">
            {plusEntries.map((e) => (
              <div key={e.id} className="bg-white rounded p-3 border border-gray-200">
                <p className="text-sm text-gray-800">{e.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">{e.author}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{e.date}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{e.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delta column */}
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <h4 className="text-sm font-semibold text-orange-700 mb-3">Δ Delta ({deltaEntries.length})</h4>
          <div className="space-y-2">
            {deltaEntries.map((e) => (
              <div key={e.id} className="bg-white rounded p-3 border border-gray-200">
                <p className="text-sm text-gray-800">{e.text}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">{e.author}</span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">{e.date}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{e.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
