import type { BudgetSummary, ScheduleSummary, QualitySummary, OwnerLoad } from './types';

export function aggregateBudgets(budgets: BudgetSummary[]): BudgetSummary {
  const originalBudget = budgets.reduce((s, b) => s + b.originalBudget, 0);
  const currentBudget = budgets.reduce((s, b) => s + b.currentBudget, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.totalSpent, 0);
  const totalRemaining = budgets.reduce((s, b) => s + b.totalRemaining, 0);
  const totalPotential = budgets.reduce((s, b) => s + b.totalPotential, 0);
  const percentSpent = currentBudget > 0 ? Math.round((totalSpent / currentBudget) * 100) : 0;
  const categories = budgets.flatMap((b) => b.categories);

  return { originalBudget, currentBudget, totalSpent, totalRemaining, totalPotential, percentSpent, categories };
}

export function aggregateSchedules(schedules: ScheduleSummary[]): ScheduleSummary {
  const phases = schedules.flatMap((s) => s.phases);
  const totalPhases = phases.length;

  // Worst-case status
  const statuses = schedules.map((s) => s.overallStatus);
  let overallStatus: ScheduleSummary['overallStatus'] = 'on-track';
  if (statuses.includes('behind')) overallStatus = 'behind';
  else if (statuses.includes('at-risk')) overallStatus = 'at-risk';

  return { totalPhases, overallStatus, phases };
}

export function aggregateQualities(qualities: QualitySummary[]): QualitySummary {
  const totalDocuments = qualities.reduce((s, q) => s + q.totalDocuments, 0);
  const affectedByOpenTasks = qualities.reduce((s, q) => s + q.affectedByOpenTasks, 0);

  // Weighted percent current
  const totalCurrent = qualities.reduce(
    (s, q) => s + Math.round((q.percentCurrent / 100) * q.totalDocuments),
    0,
  );
  const percentCurrent = totalDocuments > 0 ? Math.round((totalCurrent / totalDocuments) * 100) : 0;

  // Merge byType: group by type, sum fields
  const typeMap = new Map<string, QualitySummary['byType'][number]>();
  for (const q of qualities) {
    for (const bt of q.byType) {
      const existing = typeMap.get(bt.type);
      if (existing) {
        existing.total += bt.total;
        existing.current += bt.current;
        existing.pendingReview += bt.pendingReview;
        existing.revisionNeeded += bt.revisionNeeded;
        existing.affectedByOpenTask += bt.affectedByOpenTask;
      } else {
        typeMap.set(bt.type, { ...bt });
      }
    }
  }

  return { totalDocuments, percentCurrent, affectedByOpenTasks, byType: Array.from(typeMap.values()) };
}

export function mergeOwnerLoads(loads: OwnerLoad[]): OwnerLoad[] {
  const map = new Map<string, OwnerLoad>();
  for (const l of loads) {
    const existing = map.get(l.owner);
    if (existing) {
      existing.total += l.total;
      existing.overdue += l.overdue;
      existing.dueToday += l.dueToday;
      existing.newItems += l.newItems;
      existing.watching += l.watching;
    } else {
      map.set(l.owner, { ...l });
    }
  }
  return Array.from(map.values());
}
