'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface HuddleEntry {
  id: string;
  category: 'safety' | 'quality' | 'schedule' | 'logistics';
  note: string;
  reporter: string;
  timestamp: string;
  resolved: boolean;
}

const CATEGORIES = ['safety', 'quality', 'schedule', 'logistics'] as const;

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  safety: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '🛡' },
  quality: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: '✓' },
  schedule: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '⏱' },
  logistics: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '📦' },
};

const SEED_ENTRIES: HuddleEntry[] = [
  { id: 'h1', category: 'safety', note: 'Guardrails needed on Level 3 east side', reporter: 'J. Martinez', timestamp: '2026-02-13T07:15:00', resolved: false },
  { id: 'h2', category: 'quality', note: 'Drywall tape peeling in Zone B corridor', reporter: 'S. Kim', timestamp: '2026-02-13T07:18:00', resolved: false },
  { id: 'h3', category: 'schedule', note: 'Electrical rough-in Zone A completed 1 day early', reporter: 'T. Johnson', timestamp: '2026-02-13T07:20:00', resolved: true },
  { id: 'h4', category: 'logistics', note: 'HVAC units delivery confirmed for Thursday AM', reporter: 'R. Patel', timestamp: '2026-02-13T07:22:00', resolved: true },
  { id: 'h5', category: 'safety', note: 'Fire extinguisher missing from stairwell B', reporter: 'M. Chen', timestamp: '2026-02-13T07:25:00', resolved: false },
  { id: 'h6', category: 'schedule', note: 'Plumbing blocked in Zone C — waiting for structural sign-off', reporter: 'L. Nguyen', timestamp: '2026-02-13T07:28:00', resolved: false },
];

export function HuddleBoard() {
  const [entries, setEntries] = useState<HuddleEntry[]>(SEED_ENTRIES);
  const [showForm, setShowForm] = useState(false);
  const [formCat, setFormCat] = useState<HuddleEntry['category']>('safety');
  const [formNote, setFormNote] = useState('');
  const [formReporter, setFormReporter] = useState('');

  const toggleResolved = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, resolved: !e.resolved } : e))
    );
  };

  const addEntry = () => {
    if (!formNote.trim()) return;
    const entry: HuddleEntry = {
      id: `h${Date.now()}`,
      category: formCat,
      note: formNote.trim(),
      reporter: formReporter.trim() || 'Unknown',
      timestamp: new Date().toISOString(),
      resolved: false,
    };
    setEntries((prev) => [entry, ...prev]);
    setFormNote('');
    setFormReporter('');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Daily Huddle Board</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      {/* Quick add form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-3">
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFormCat(cat)}
                className={clsx(
                  'px-3 py-1 rounded text-xs font-medium capitalize transition-colors',
                  formCat === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Note..."
            value={formNote}
            onChange={(e) => setFormNote(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Reporter name"
              value={formReporter}
              onChange={(e) => setFormReporter(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addEntry}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Entries by category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => {
          const style = CATEGORY_STYLES[cat];
          const items = entries.filter((e) => e.category === cat);
          return (
            <div key={cat} className={clsx('rounded-lg border p-4', style.bg, style.border)}>
              <h4 className={clsx('text-sm font-semibold capitalize mb-2', style.text)}>
                {style.icon} {cat} ({items.length})
              </h4>
              <div className="space-y-2">
                {items.map((entry) => (
                  <div
                    key={entry.id}
                    className={clsx(
                      'flex items-start gap-2 bg-white rounded p-2 border border-gray-200 text-sm',
                      entry.resolved && 'opacity-60'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={entry.resolved}
                      onChange={() => toggleResolved(entry.id)}
                      className="mt-0.5 rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={clsx('text-gray-800', entry.resolved && 'line-through')}>
                        {entry.note}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {entry.reporter} · {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-gray-400 italic">No entries</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
