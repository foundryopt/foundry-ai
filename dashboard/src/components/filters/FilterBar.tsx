'use client';

import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import type { FilterState, TaskCategory, Urgency } from '@/lib/types';
import { ALL_CATEGORIES, URGENCY_LABELS, URGENCY_ORDER } from '@/lib/constants';

interface FilterBarProps {
  filters: FilterState;
  owners: string[];
  costCodes: string[];
  projects: { id: string; name: string }[];
  onToggleCategory: (c: TaskCategory) => void;
  onToggleOwner: (o: string) => void;
  onToggleUrgency: (u: Urgency) => void;
  onToggleCostCode: (c: string) => void;
  onToggleProject: (p: string) => void;
  onClear: () => void;
  hasActive: boolean;
}

/* ── Reusable dropdown ── */

function FilterDropdown<T extends string>({
  label,
  options,
  selected,
  onToggle,
  getLabel,
}: {
  label: string;
  options: T[];
  selected: T[];
  onToggle: (v: T) => void;
  getLabel?: (v: T) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const count = selected.length;
  const displayLabel = getLabel ?? ((v: T) => v);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          'flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border transition-colors whitespace-nowrap',
          count > 0
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
        )}
      >
        {label}
        {count > 0 && (
          <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
            {count}
          </span>
        )}
        <svg className={clsx('w-3 h-3 transition-transform', open && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 left-0 min-w-[160px] max-h-[240px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {options.map((opt) => {
            const isActive = selected.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => onToggle(opt)}
                className={clsx(
                  'w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-gray-50 transition-colors',
                  isActive && 'bg-blue-50',
                )}
              >
                <span className={clsx(
                  'w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0',
                  isActive ? 'bg-blue-600 border-blue-600' : 'border-gray-300',
                )}>
                  {isActive && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className={clsx(isActive ? 'text-blue-700 font-medium' : 'text-gray-700')}>
                  {displayLabel(opt)}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FilterBar({
  filters,
  owners,
  costCodes,
  projects,
  onToggleCategory,
  onToggleOwner,
  onToggleUrgency,
  onToggleCostCode,
  onToggleProject,
  onClear,
  hasActive,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {projects.length > 1 && (
        <FilterDropdown
          label="Project"
          options={projects.map((p) => p.id)}
          selected={filters.projects}
          onToggle={onToggleProject}
          getLabel={(id) => projects.find((p) => p.id === id)?.name.split('—')[0].trim() ?? id}
        />
      )}

      <FilterDropdown
        label="Category"
        options={ALL_CATEGORIES as unknown as TaskCategory[]}
        selected={filters.categories}
        onToggle={onToggleCategory}
      />

      <FilterDropdown
        label="Owner"
        options={owners}
        selected={filters.owners}
        onToggle={onToggleOwner}
      />

      <FilterDropdown
        label="Urgency"
        options={[...URGENCY_ORDER]}
        selected={filters.urgencies}
        onToggle={onToggleUrgency}
        getLabel={(u) => URGENCY_LABELS[u]}
      />

      {costCodes.length > 0 && (
        <FilterDropdown
          label="Cost Code"
          options={costCodes}
          selected={filters.costCodes}
          onToggle={onToggleCostCode}
        />
      )}

      {hasActive && (
        <button
          onClick={onClear}
          className="text-xs text-gray-500 hover:text-red-600 px-2 py-1.5 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
