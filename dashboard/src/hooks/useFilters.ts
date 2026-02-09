'use client';

import { useCallback, useState } from 'react';
import type { FilterState, TaskCategory, Urgency } from '@/lib/types';
import { emptyFilters } from '@/lib/filters';

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters());

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const toggleCategory = useCallback((category: TaskCategory) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  }, []);

  const toggleOwner = useCallback((owner: string) => {
    setFilters((prev) => ({
      ...prev,
      owners: prev.owners.includes(owner)
        ? prev.owners.filter((o) => o !== owner)
        : [...prev.owners, owner],
    }));
  }, []);

  const toggleUrgency = useCallback((urgency: Urgency) => {
    setFilters((prev) => ({
      ...prev,
      urgencies: prev.urgencies.includes(urgency)
        ? prev.urgencies.filter((u) => u !== urgency)
        : [...prev.urgencies, urgency],
    }));
  }, []);

  const toggleCostCode = useCallback((costCode: string) => {
    setFilters((prev) => ({
      ...prev,
      costCodes: prev.costCodes.includes(costCode)
        ? prev.costCodes.filter((c) => c !== costCode)
        : [...prev.costCodes, costCode],
    }));
  }, []);

  const toggleProject = useCallback((projectId: string) => {
    setFilters((prev) => ({
      ...prev,
      projects: prev.projects.includes(projectId)
        ? prev.projects.filter((p) => p !== projectId)
        : [...prev.projects, projectId],
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(emptyFilters());
  }, []);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.categories.length > 0 ||
    filters.owners.length > 0 ||
    filters.urgencies.length > 0 ||
    filters.costCodes.length > 0 ||
    filters.projects.length > 0;

  return {
    filters,
    setSearch,
    toggleCategory,
    toggleOwner,
    toggleUrgency,
    toggleCostCode,
    toggleProject,
    clearFilters,
    hasActiveFilters,
  };
}
