import type { TimesheetCostCode as PrismaTCC, TimesheetRoleHours } from '@prisma/client';
import type { TimesheetSummary, TimesheetCostCode, RoleHours, TimesheetRole, CORecipient } from '../shared/types';

type TCCWithRoles = PrismaTCC & { roleBreakdown: TimesheetRoleHours[] };

export function serializeTimesheetCostCode(tcc: TCCWithRoles): TimesheetCostCode {
  const result: TimesheetCostCode = {
    costCode: tcc.costCode,
    description: tcc.description,
    jobName: tcc.jobName,
    roleBreakdown: tcc.roleBreakdown.map((rh): RoleHours => ({
      role: rh.role as TimesheetRole,
      budgeted: rh.budgeted,
      spent: rh.spent,
      remaining: rh.remaining,
      coHours: rh.coHours,
      pcoHours: rh.pcoHours,
    })),
    totalBudgeted: tcc.totalBudgeted,
    totalSpent: tcc.totalSpent,
    totalRemaining: tcc.totalRemaining,
    totalCO: tcc.totalCO,
    totalPCO: tcc.totalPCO,
    percentComplete: tcc.percentComplete,
    percentUsed: tcc.percentUsed,
    overspend: tcc.overspend,
  };
  if (tcc.coRecommendation) {
    result.coRecommendation = tcc.coRecommendation as {
      recipient: CORecipient;
      reason: string;
      estimatedHours: number;
    };
  }
  return result;
}

export function serializeTimesheetSummary(costCodes: TCCWithRoles[]): TimesheetSummary {
  const serialized = costCodes.map(serializeTimesheetCostCode);
  const totalBudgetedHours = serialized.reduce((s, c) => s + c.totalBudgeted, 0);
  const totalSpentHours = serialized.reduce((s, c) => s + c.totalSpent, 0);
  const totalRemainingHours = serialized.reduce((s, c) => s + c.totalRemaining, 0);
  const totalCOHours = serialized.reduce((s, c) => s + c.totalCO, 0);
  const totalPCOHours = serialized.reduce((s, c) => s + c.totalPCO, 0);
  const percentUsed = totalBudgetedHours > 0 ? Math.round((totalSpentHours / totalBudgetedHours) * 100) : 0;
  const overspendCount = serialized.filter((c) => c.overspend).length;

  return {
    totalBudgetedHours,
    totalSpentHours,
    totalRemainingHours,
    totalCOHours,
    totalPCOHours,
    percentUsed,
    overspendCount,
    costCodes: serialized,
  };
}
