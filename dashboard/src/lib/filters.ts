import type { FilterState, OpenTask, Urgency } from './types';
import { URGENCY_ORDER } from './constants';

/** Apply all active filters to a task list */
export function applyFilters(tasks: OpenTask[], filters: FilterState): OpenTask[] {
  return tasks.filter((task) => {
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const searchable = `${task.id} ${task.subject} ${task.owner} ${task.category} ${task.costCodeRef ?? ''}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // Category filter
    if (filters.categories.length > 0 && !filters.categories.includes(task.category)) {
      return false;
    }

    // Owner filter
    if (filters.owners.length > 0 && !filters.owners.includes(task.owner)) {
      return false;
    }

    // Urgency filter
    if (filters.urgencies.length > 0 && !filters.urgencies.includes(task.urgency)) {
      return false;
    }

    // Cost code filter
    if (filters.costCodes.length > 0) {
      if (!task.costCodeRef || !filters.costCodes.includes(task.costCodeRef)) return false;
    }

    // Project filter
    if (filters.projects.length > 0 && !filters.projects.includes(task.projectId)) {
      return false;
    }

    return true;
  });
}

/** Group tasks by urgency in standard order */
export function groupByUrgency(tasks: OpenTask[]): Record<Urgency, OpenTask[]> {
  const groups: Record<Urgency, OpenTask[]> = {
    overdue: [],
    'due-today': [],
    new: [],
    watching: [],
  };

  for (const task of tasks) {
    groups[task.urgency].push(task);
  }

  // Sort within each group: overdue by most days first, others by SLA date
  groups.overdue.sort((a, b) => (b.daysOverdue ?? 0) - (a.daysOverdue ?? 0));
  groups['due-today'].sort((a, b) => a.subject.localeCompare(b.subject));
  groups.new.sort((a, b) => a.subject.localeCompare(b.subject));
  groups.watching.sort((a, b) => (a.daysUntilDue ?? 99) - (b.daysUntilDue ?? 99));

  return groups;
}

/** Get unique values from task list for filter options */
export function getFilterOptions(tasks: OpenTask[]) {
  const categories = [...new Set(tasks.map((t) => t.category))].sort();
  const owners = [...new Set(tasks.map((t) => t.owner))].sort();
  const costCodes = [...new Set(tasks.map((t) => t.costCodeRef).filter(Boolean) as string[])].sort();
  const projects = [...new Set(tasks.map((t) => t.projectId))].sort();
  return { categories, owners, urgencies: [...URGENCY_ORDER], costCodes, projects };
}

/** Default empty filter state */
export function emptyFilters(): FilterState {
  return { search: '', categories: [], owners: [], urgencies: [], costCodes: [], projects: [] };
}
