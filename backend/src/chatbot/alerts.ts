/**
 * Alert Generator
 * Generates proactive alerts based on project data thresholds.
 */

import type { ProjectData } from '../shared/types';

export interface Alert {
  id: string;
  type: 'sla-breach' | 'budget-warning' | 'schedule-risk' | 'quality-drop' | 'warranty-urgent';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  projectId?: string;
  relatedIds: string[];
  timestamp: string;
}

export function generateAlerts(data: ProjectData, projectId: string): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date().toISOString();

  // SLA breaches
  const overdueTasks = data.tasks.filter((t) => t.urgency === 'overdue');
  for (const task of overdueTasks) {
    if (task.daysOverdue && task.daysOverdue >= 5) {
      alerts.push({
        id: `alert-sla-${task.id}`,
        type: 'sla-breach',
        severity: 'critical',
        title: `SLA Breach: ${task.category} ${task.id}`,
        message: `${task.subject} is ${task.daysOverdue} days overdue. Owner: ${task.owner}.`,
        projectId,
        relatedIds: [task.id],
        timestamp: now,
      });
    }
  }

  // Budget warning
  if (data.budget.percentSpent > 90) {
    alerts.push({
      id: `alert-budget-${projectId}`,
      type: 'budget-warning',
      severity: 'warning',
      title: 'Budget Warning',
      message: `Project is ${data.budget.percentSpent}% spent with $${data.budget.totalRemaining.toLocaleString()} remaining.`,
      projectId,
      relatedIds: [],
      timestamp: now,
    });
  }

  // Schedule risk
  if (data.schedule.overallStatus === 'behind') {
    alerts.push({
      id: `alert-schedule-${projectId}`,
      type: 'schedule-risk',
      severity: 'critical',
      title: 'Schedule Behind',
      message: 'Project schedule is BEHIND. Review critical path for recovery options.',
      projectId,
      relatedIds: [],
      timestamp: now,
    });
  }

  // Urgent warranties
  const urgentWarranties = data.warranties.filter((w) => w.severity === 'urgent' && w.status === 'open');
  for (const w of urgentWarranties) {
    alerts.push({
      id: `alert-warranty-${w.id}`,
      type: 'warranty-urgent',
      severity: 'warning',
      title: `Urgent Warranty: ${w.unit}`,
      message: `${w.issueType} — ${w.description.substring(0, 100)}...`,
      projectId,
      relatedIds: [w.id],
      timestamp: now,
    });
  }

  return alerts;
}
