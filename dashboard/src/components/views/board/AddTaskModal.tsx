'use client';

import { useEffect, useState } from 'react';
import type { BoardStatus, BoardTask, TaskCategory } from '@/lib/types';
import { ALL_CATEGORIES } from '@/lib/constants';
import { BOARD_STATUS_LABELS, BOARD_STATUS_ORDER } from '@/lib/types';

interface AddTaskModalProps {
  open: boolean;
  defaultStatus: BoardStatus;
  projectId: string;
  onClose: () => void;
  onCreate: (task: BoardTask) => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function nextWeekIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export function AddTaskModal({ open, defaultStatus, projectId, onClose, onCreate }: AddTaskModalProps) {
  const [subject, setSubject] = useState('');
  const [owner, setOwner] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Decision');
  const [status, setStatus] = useState<BoardStatus>(defaultStatus);
  const [slaDate, setSlaDate] = useState(nextWeekIso());

  useEffect(() => {
    if (open) setStatus(defaultStatus);
  }, [open, defaultStatus]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !owner.trim()) return;
    onCreate({
      id: `TASK-${Date.now().toString(36).toUpperCase()}`,
      projectId,
      category,
      subject: subject.trim(),
      owner: owner.trim(),
      slaDate,
      createdDate: todayIso(),
      status,
      source: 'Manual',
    });
    setSubject('');
    setOwner('');
    setCategory('Decision');
    setSlaDate(nextWeekIso());
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">New Task</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
              <input
                autoFocus
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What needs to happen?"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {ALL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BoardStatus)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  {BOARD_STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>{BOARD_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Owner</label>
                <input
                  type="text"
                  required
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g. Taylor R."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Due date</label>
                <input
                  type="date"
                  required
                  value={slaDate}
                  onChange={(e) => setSlaDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-snug">
              Local-only board. Tasks reset on reload. Per CLAUDE.md, AI does not write to systems of record — humans confirm in Slack/Drive.
            </p>
          </div>

          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
