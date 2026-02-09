'use client';

import { useMemo } from 'react';
import type { OpenTask } from '@/lib/types';
import { URGENCY_ORDER } from '@/lib/constants';
import { applyFilters, groupByUrgency, getFilterOptions } from '@/lib/filters';
import { useFilters } from '@/hooks/useFilters';
import { useDetailPanel } from '@/hooks/useDetailPanel';
import { SearchBar } from '@/components/filters/SearchBar';
import { FilterBar } from '@/components/filters/FilterBar';
import { CountsBar } from '@/components/cards/CountsBar';
import { UrgencyGroup } from '@/components/cards/UrgencyGroup';
import { DetailPanel } from '@/components/detail/DetailPanel';
import { EmptyState } from '@/components/ui/EmptyState';

interface AttentionTodayProps {
  tasks: OpenTask[];
}

export function AttentionToday({ tasks }: AttentionTodayProps) {
  const {
    filters,
    setSearch,
    toggleCategory,
    toggleOwner,
    toggleUrgency,
    clearFilters,
    hasActiveFilters,
  } = useFilters();

  const { selectedId, select, close } = useDetailPanel();

  const filtered = useMemo(() => applyFilters(tasks, filters), [tasks, filters]);
  const grouped = useMemo(() => groupByUrgency(filtered), [filtered]);
  const { owners } = useMemo(() => getFilterOptions(tasks), [tasks]);

  const selectedTask = selectedId ? tasks.find((t) => t.id === selectedId) ?? null : null;

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1 min-w-0 max-w-3xl mx-auto px-4 py-4">
        {/* Search */}
        <SearchBar value={filters.search} onChange={setSearch} />

        {/* Filters */}
        <div className="mt-3">
          <FilterBar
            filters={filters}
            owners={owners}
            onToggleCategory={toggleCategory}
            onToggleOwner={toggleOwner}
            onToggleUrgency={toggleUrgency}
            onClear={clearFilters}
            hasActive={hasActiveFilters}
          />
        </div>

        {/* Counts */}
        <CountsBar tasks={filtered} />

        {/* Urgency groups */}
        {filtered.length === 0 ? (
          <EmptyState
            message={
              hasActiveFilters
                ? 'No tasks match your filters.'
                : 'No open tasks. Everything is on track.'
            }
          />
        ) : (
          <div className="space-y-2 mt-2">
            {URGENCY_ORDER.map((urgency) => (
              <UrgencyGroup
                key={urgency}
                urgency={urgency}
                tasks={grouped[urgency]}
                onSelectTask={select}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      <DetailPanel
        task={selectedTask}
        allTasks={tasks}
        onClose={close}
        onSelectTask={select}
      />
    </div>
  );
}
