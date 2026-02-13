/**
 * Intelligence Module
 * Generates high-level project intelligence summaries and risk assessments.
 */

import type { ProjectData } from '../shared/types';

interface ProjectIntelligence {
  riskScore: number; // 0-100
  topRisks: string[];
  recommendations: string[];
  summary: string;
}

export function generateIntelligence(data: ProjectData, projectName: string): ProjectIntelligence {
  const risks: string[] = [];
  let riskScore = 0;

  // Budget risk
  if (data.budget.percentSpent > 85) {
    risks.push(`Budget ${data.budget.percentSpent}% spent with ${data.budget.totalPotential > 0 ? `$${data.budget.totalPotential.toLocaleString()} in pending COs` : 'no pending COs'}`);
    riskScore += 20;
  }

  // Schedule risk
  if (data.schedule.overallStatus === 'behind') {
    risks.push('Schedule status: BEHIND — critical path activities delayed');
    riskScore += 30;
  } else if (data.schedule.overallStatus === 'at-risk') {
    risks.push('Schedule status: AT-RISK — variance detected in active phases');
    riskScore += 15;
  }

  // Overdue tasks
  const overdueTasks = data.tasks.filter((t) => t.urgency === 'overdue');
  if (overdueTasks.length > 3) {
    risks.push(`${overdueTasks.length} overdue tasks — pattern indicates process gap`);
    riskScore += 15;
  }

  // Quality risk
  if (data.quality.percentCurrent < 90) {
    risks.push(`Document quality at ${data.quality.percentCurrent}% current — ${data.quality.affectedByOpenTasks} affected by open tasks`);
    riskScore += 10;
  }

  // Timesheet overspend
  if (data.timesheet.overspendCount > 2) {
    risks.push(`${data.timesheet.overspendCount} cost codes over budget on hours`);
    riskScore += 10;
  }

  // Warranty issues
  const urgentWarranties = data.warranties.filter((w) => w.severity === 'urgent' && w.status !== 'resolved');
  if (urgentWarranties.length > 0) {
    risks.push(`${urgentWarranties.length} urgent warranty items unresolved`);
    riskScore += 10;
  }

  // Recommendations
  const recommendations: string[] = [];
  if (overdueTasks.length > 0) {
    recommendations.push(`Prioritize ${overdueTasks.length} overdue tasks — escalate items older than 5 days`);
  }
  if (data.budget.totalPotential > 0) {
    recommendations.push(`Review $${data.budget.totalPotential.toLocaleString()} in pending change orders before next draw`);
  }
  if (data.timesheet.overspendCount > 0) {
    recommendations.push('Review CO recommendations on overspent cost codes');
  }

  const summary = `${projectName}: Risk score ${Math.min(100, riskScore)}/100. ${risks.length} risk factors identified. ${data.tasks.length} open tasks, ${overdueTasks.length} overdue.`;

  return {
    riskScore: Math.min(100, riskScore),
    topRisks: risks.slice(0, 5),
    recommendations,
    summary,
  };
}
