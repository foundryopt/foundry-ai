'use client';

import type { FilterState, TaskCategory, Urgency } from '@/lib/types';
import { ALL_CATEGORIES, URGENCY_LABELS, URGENCY_ORDER } from '@/lib/constants';
import { FilterChip } from './FilterChip';

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
    <div className="space-y-2">
      {/* Project chips */}
      {projects.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 self-center mr-1">
            Project
          </span>
          {projects.map((p) => (
            <FilterChip
              key={p.id}
              label={p.name.split('—')[0].trim()}
              active={filters.projects.includes(p.id)}
              onClick={() => onToggleProject(p.id)}
            />
          ))}
        </div>
      )}

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 self-center mr-1">
          Category
        </span>
        {ALL_CATEGORIES.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            active={filters.categories.includes(cat)}
            onClick={() => onToggleCategory(cat)}
          />
        ))}
      </div>

      {/* Owner chips */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 self-center mr-1">
          Owner
        </span>
        {owners.map((owner) => (
          <FilterChip
            key={owner}
            label={owner}
            active={filters.owners.includes(owner)}
            onClick={() => onToggleOwner(owner)}
          />
        ))}
      </div>

      {/* Urgency chips */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 self-center mr-1">
          Urgency
        </span>
        {URGENCY_ORDER.map((u) => (
          <FilterChip
            key={u}
            label={URGENCY_LABELS[u]}
            active={filters.urgencies.includes(u)}
            onClick={() => onToggleUrgency(u)}
          />
        ))}
      </div>

      {/* Cost code chips */}
      {costCodes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[10px] uppercase tracking-wider text-gray-400 self-center mr-1">
            Cost Code
          </span>
          {costCodes.map((cc) => (
            <FilterChip
              key={cc}
              label={cc}
              active={filters.costCodes.includes(cc)}
              onClick={() => onToggleCostCode(cc)}
            />
          ))}
        </div>
      )}

      {hasActive && (
        <button
          onClick={onClear}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
