/**
 * Time Entry Processor
 * Analyzes timesheet entries to detect overspend patterns and CO recommendations.
 */

interface TimeEntry {
  costCode: string;
  role: string;
  hours: number;
  date: string;
  description: string;
}

interface OverspendAlert {
  costCode: string;
  role: string;
  budgetedHours: number;
  spentHours: number;
  percentOver: number;
  recommendation: string;
}

export function processTimeEntries(
  entries: TimeEntry[],
  budgets: { costCode: string; role: string; budgetedHours: number }[],
): OverspendAlert[] {
  const alerts: OverspendAlert[] = [];
  const spentMap = new Map<string, number>();

  // Aggregate hours by costCode-role
  for (const entry of entries) {
    const key = `${entry.costCode}|${entry.role}`;
    spentMap.set(key, (spentMap.get(key) || 0) + entry.hours);
  }

  // Check against budgets
  for (const budget of budgets) {
    const key = `${budget.costCode}|${budget.role}`;
    const spent = spentMap.get(key) || 0;

    if (spent > budget.budgetedHours * 0.9) {
      const percentOver = Math.round(((spent - budget.budgetedHours) / budget.budgetedHours) * 100);
      alerts.push({
        costCode: budget.costCode,
        role: budget.role,
        budgetedHours: budget.budgetedHours,
        spentHours: spent,
        percentOver: Math.max(0, percentOver),
        recommendation: spent > budget.budgetedHours
          ? `Over budget by ${percentOver}%. Review scope and consider CO.`
          : `Approaching budget limit (${Math.round((spent / budget.budgetedHours) * 100)}% used). Monitor closely.`,
      });
    }
  }

  return alerts;
}
