'use client';

import clsx from 'clsx';
import { VIEW_LABELS, type ViewTab } from '@/lib/types';

interface TabBarProps {
  active: ViewTab;
  onChange: (tab: ViewTab) => void;
}

const TABS: ViewTab[] = [0, 1, 2, 3];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="bg-white border-b border-gray-200 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={clsx(
              'px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-w-tap',
              active === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            )}
          >
            {VIEW_LABELS[tab]}
          </button>
        ))}
      </div>
    </nav>
  );
}
