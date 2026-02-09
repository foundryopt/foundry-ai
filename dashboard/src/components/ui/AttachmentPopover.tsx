'use client';

import { useState, useRef, useEffect } from 'react';
import type { Attachment } from '@/lib/types';

const TYPE_ICONS: Record<string, JSX.Element> = {
  contract: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2h6l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
      <path d="M10 2v4h4" />
    </svg>
  ),
  spec: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 6h6M5 8h6M5 10h4" />
      <rect x="2" y="1" width="12" height="14" rx="1" />
    </svg>
  ),
  drawing: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="12" rx="1" />
      <path d="M2 11l3-3 2 2 4-4 3 3" />
    </svg>
  ),
  photo: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="14" height="10" rx="1" />
      <circle cx="5" cy="7" r="1.5" />
      <path d="M15 10l-4-3-3 2.5L5 7l-4 4" />
    </svg>
  ),
};

interface AttachmentPopoverProps {
  attachments: Attachment[];
}

export function AttachmentPopover({ attachments }: AttachmentPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="text-gray-400 hover:text-blue-600 transition-colors p-0.5"
        title="Attachments"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13.5 7.5l-5.8 5.8a3 3 0 01-4.2-4.2l5.8-5.8a2 2 0 012.8 2.8L6.3 11.9a1 1 0 01-1.4-1.4L10.1 5" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 right-0 mt-1 w-60 bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-1">
          {attachments.map((a, i) => (
            <a
              key={i}
              href={a.url}
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-blue-50 rounded transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-gray-400 shrink-0">{TYPE_ICONS[a.type]}</span>
              <span className="truncate">{a.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
