'use client';

import { useState } from 'react';
import type { BudgetComment } from '@/lib/types';
import { formatRelative } from '@/lib/utils';

interface CommentThreadProps {
  comments: BudgetComment[];
  lineItemId: string;
  onAddComment: (text: string, sendToSlack: boolean) => void;
  onClose: () => void;
}

export function CommentThread({ comments, lineItemId, onAddComment, onClose }: CommentThreadProps) {
  const [text, setText] = useState('');
  const [sendToSlack, setSendToSlack] = useState(false);

  const filtered = comments.filter((c) => c.lineItemId === lineItemId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(text.trim(), sendToSlack);
    setText('');
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-700">Comments</h4>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      {filtered.length === 0 && (
        <p className="text-xs text-gray-400 italic">No comments yet.</p>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filtered.map((c) => (
          <div key={c.id} className="flex gap-2 text-xs">
            <div className="shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
              {c.author.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-800">{c.author}</span>
                {c.source === 'slack' && (
                  <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-medium">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M6 1a2 2 0 00-2 2v3H2a2 2 0 100 4h2v3a2 2 0 104 0v-3h2v3a2 2 0 104 0V10h-2a2 2 0 110-4h2V3a2 2 0 10-4 0v3h-2V3a2 2 0 00-2-2z"/></svg>
                    Slack
                  </span>
                )}
                <span className="text-gray-400">{formatRelative(c.timestamp)}</span>
              </div>
              <p className="text-gray-600 mt-0.5">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <label className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sendToSlack}
              onChange={(e) => setSendToSlack(e.target.checked)}
              className="w-3 h-3 rounded border-gray-300"
            />
            Send to Slack
            {/* TODO: Wire up Slack webhook integration */}
          </label>
        </div>
        <button
          type="submit"
          disabled={!text.trim()}
          className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
