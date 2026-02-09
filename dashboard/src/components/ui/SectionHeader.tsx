'use client';

import { useState } from 'react';
import clsx from 'clsx';

interface SectionHeaderProps {
  title: string;
  count: number;
  colorClass?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SectionHeader({
  title,
  count,
  colorClass = 'text-gray-700',
  defaultOpen = true,
  children,
}: SectionHeaderProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-2 text-left"
      >
        <span className={clsx('text-xs font-bold uppercase tracking-wider', colorClass)}>
          {title}
        </span>
        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
          {count}
        </span>
        <span className="text-gray-400 text-xs ml-auto">{open ? '▼' : '▶'}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
