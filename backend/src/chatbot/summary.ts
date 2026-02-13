/**
 * Daily Summary Generator
 * Generates role-based daily summaries for project teams.
 */

import type { ProjectData, Role } from '../shared/types';

export interface DailySummary {
  date: string;
  projectName: string;
  role: Role;
  sections: {
    title: string;
    items: string[];
  }[];
}

export function generateDailySummary(
  data: ProjectData,
  projectName: string,
  role: Role,
  date: string = new Date().toISOString().split('T')[0],
): DailySummary {
  const sections: DailySummary['sections'] = [];

  // Overdue items
  const overdue = data.tasks.filter((t) => t.urgency === 'overdue');
  if (overdue.length > 0) {
    sections.push({
      title: 'Overdue Items',
      items: overdue.map((t) => `[${t.category}] ${t.subject} — ${t.daysOverdue}d overdue (${t.owner})`),
    });
  }

  // Due today
  const dueToday = data.tasks.filter((t) => t.urgency === 'due-today');
  if (dueToday.length > 0) {
    sections.push({
      title: 'Due Today',
      items: dueToday.map((t) => `[${t.category}] ${t.subject} (${t.owner})`),
    });
  }

  // Role-specific sections
  if (role === 'PM' || role === 'Principal') {
    // Budget snapshot
    sections.push({
      title: 'Budget Snapshot',
      items: [
        `Budget: $${data.budget.currentBudget.toLocaleString()} | Spent: ${data.budget.percentSpent}%`,
        `Remaining: $${data.budget.totalRemaining.toLocaleString()} | Pending COs: $${data.budget.totalPotential.toLocaleString()}`,
      ],
    });

    // Schedule snapshot
    sections.push({
      title: 'Schedule',
      items: [`Overall status: ${data.schedule.overallStatus.toUpperCase()}`],
    });
  }

  if (role === 'Super') {
    // Pre-task items
    const preTasks = data.tasks.filter((t) => t.category === 'Pre-Task');
    if (preTasks.length > 0) {
      sections.push({
        title: 'Pre-Task Planning',
        items: preTasks.map((t) => t.subject),
      });
    }
  }

  if (role === 'Procurement') {
    // Lead time alerts
    const leadTimes = data.tasks.filter((t) => t.category === 'Lead Time');
    if (leadTimes.length > 0) {
      sections.push({
        title: 'Procurement / Lead Times',
        items: leadTimes.map((t) => `${t.subject} — ${t.urgency}`),
      });
    }
  }

  return { date, projectName, role, sections };
}
