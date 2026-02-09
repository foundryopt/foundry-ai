'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import { VIEW_LABELS, COMMON_TABS, RESTRICTED_TABS, type ViewTab } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

interface TabBarProps {
  active: ViewTab;
  onChange: (tab: ViewTab) => void;
}

export function TabBar({ active, onChange }: TabBarProps) {
  const { user } = useAuth();

  const visibleTabs = useMemo(() => {
    const tabs: ViewTab[] = [...COMMON_TABS];
    if (user) {
      for (const rt of RESTRICTED_TABS) {
        if (rt.roles.includes(user.role)) {
          tabs.push(rt.tab);
        }
      }
    }
    return tabs;
  }, [user]);

  return (
    <nav className="bg-white border-b border-gray-200 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex">
        {visibleTabs.map((tab) => (
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
