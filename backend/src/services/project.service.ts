import { prisma } from './prisma';
import type { ProjectData, BudgetSummary, ScheduleSummary, QualitySummary, TimesheetSummary, FundSummary, OwnerLoad } from '../shared/types';
import { serializeTasks } from '../serializers/task.serializer';
import { serializeBudgetSummary } from '../serializers/budget.serializer';
import { serializeScheduleSummary } from '../serializers/schedule.serializer';
import { serializeQualitySummary } from '../serializers/quality.serializer';
import { serializeCriticalPath } from '../serializers/critical-path.serializer';
import { serializeTimesheetSummary } from '../serializers/timesheet.serializer';
import { serializeQAQCData } from '../serializers/qaqc.serializer';
import { serializeWarranty } from '../serializers/warranty.serializer';
import { serializeDevMilestone, serializeFundDraw, serializeLeasingUnit, serializeShowroomEvent, serializePOSItem, serializeMembership } from '../serializers/business.serializer';
import { serializeFinish } from '../serializers/design.serializer';

async function getProjectDataSingle(projectId: string): Promise<ProjectData> {
  const [
    tasks, budgetCats, schedulePhases, qualityByType,
    cpMilestones, cpActivities,
    timesheetCCs, qaqcDocs, qcChecklists,
    repeatBreaches, ownerLoads, invoicePatterns,
    warranties, devMilestones, fundDraws,
    leasingUnits, events, posItems, memberships, finishes,
  ] = await Promise.all([
    prisma.task.findMany({ where: { projectId } }),
    prisma.budgetCategory.findMany({
      where: { projectId },
      include: { lineItems: true, project: { select: { name: true } } },
    }),
    prisma.schedulePhase.findMany({ where: { projectId } }),
    prisma.qualityByType.findMany({ where: { projectId } }),
    prisma.criticalPathMilestone.findMany({ where: { projectId } }),
    prisma.milestoneActivity.findMany({ where: { projectId } }),
    prisma.timesheetCostCode.findMany({
      where: { projectId },
      include: { roleBreakdown: true },
    }),
    prisma.qAQCDocument.findMany({ where: { projectId } }),
    prisma.qCChecklist.findMany({ where: { projectId } }),
    prisma.repeatBreach.findMany({ where: { projectId } }),
    prisma.ownerLoad.findMany({ where: { projectId } }),
    prisma.invoicePattern.findMany({ where: { projectId } }),
    prisma.warrantyItem.findMany({ where: { projectId } }),
    prisma.devMilestone.findMany({ where: { projectId } }),
    prisma.fundDraw.findMany({ where: { projectId }, orderBy: { drawNumber: 'asc' } }),
    prisma.leasingUnit.findMany({ where: { projectId } }),
    prisma.showroomEvent.findMany({ where: { projectId }, orderBy: { date: 'asc' } }),
    prisma.pOSItem.findMany({ where: { projectId } }),
    prisma.membership.findMany({ where: { projectId } }),
    prisma.finishSelection.findMany({ where: { projectId } }),
  ]);

  // Compute fund summary
  const totalDrawn = fundDraws.filter((d) => d.status === 'approved').reduce((s, d) => s + d.amount, 0);
  const allDrawsAmount = fundDraws.reduce((s, d) => s + d.amount, 0);
  // Store fund commitment in a reasonable way - estimate from total draws
  const fundSummary: FundSummary = fundDraws.length > 0
    ? {
        totalCommitment: Math.round(allDrawsAmount * 1.35),
        totalDrawn,
        totalRemaining: Math.round(allDrawsAmount * 1.35) - totalDrawn,
        draws: fundDraws.map(serializeFundDraw),
      }
    : { totalCommitment: 0, totalDrawn: 0, totalRemaining: 0, draws: [] };

  return {
    tasks: serializeTasks(tasks),
    budget: serializeBudgetSummary(budgetCats as any),
    schedule: serializeScheduleSummary(schedulePhases),
    quality: serializeQualitySummary(qualityByType),
    criticalPath: serializeCriticalPath(cpMilestones, cpActivities),
    timesheet: serializeTimesheetSummary(timesheetCCs as any),
    qaqc: serializeQAQCData(qaqcDocs, qcChecklists),
    repeatBreaches: repeatBreaches.map((rb) => ({
      projectId: rb.projectId,
      category: rb.category as any,
      owner: rb.owner,
      count: rb.count,
      avgDaysOverdue: rb.avgDaysOverdue,
      pattern: rb.pattern,
    })),
    ownerLoads: ownerLoads.map((ol) => ({
      projectId: ol.projectId,
      owner: ol.owner,
      role: ol.role as any,
      total: ol.total,
      overdue: ol.overdue,
      dueToday: ol.dueToday,
      newItems: ol.newItems,
      watching: ol.watching,
    })),
    invoicePatterns: invoicePatterns.map((ip) => ({
      projectId: ip.projectId,
      vendor: ip.vendor,
      invoiceCount: ip.invoiceCount,
      issueCount: ip.issueCount,
      commonIssue: ip.commonIssue,
      avgResolutionDays: ip.avgResolutionDays,
    })),
    warranties: warranties.map(serializeWarranty),
    devMilestones: devMilestones.map(serializeDevMilestone),
    fund: fundSummary,
    leasing: leasingUnits.map(serializeLeasingUnit),
    events: events.map(serializeShowroomEvent),
    pos: posItems.map(serializePOSItem),
    memberships: memberships.map(serializeMembership),
    finishes: finishes.map(serializeFinish),
  };
}

// ── Aggregation helpers (mirrors dashboard/src/lib/aggregation.ts) ──

function aggregateBudgets(budgets: BudgetSummary[]): BudgetSummary {
  const originalBudget = budgets.reduce((s, b) => s + b.originalBudget, 0);
  const currentBudget = budgets.reduce((s, b) => s + b.currentBudget, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.totalSpent, 0);
  const totalRemaining = budgets.reduce((s, b) => s + b.totalRemaining, 0);
  const totalPotential = budgets.reduce((s, b) => s + b.totalPotential, 0);
  const percentSpent = currentBudget > 0 ? Math.round((totalSpent / currentBudget) * 100) : 0;
  return { originalBudget, currentBudget, totalSpent, totalRemaining, totalPotential, percentSpent, categories: budgets.flatMap((b) => b.categories) };
}

function aggregateSchedules(schedules: ScheduleSummary[]): ScheduleSummary {
  const phases = schedules.flatMap((s) => s.phases);
  const statuses = schedules.map((s) => s.overallStatus);
  let overallStatus: ScheduleSummary['overallStatus'] = 'on-track';
  if (statuses.includes('behind')) overallStatus = 'behind';
  else if (statuses.includes('at-risk')) overallStatus = 'at-risk';
  return { totalPhases: phases.length, overallStatus, phases };
}

function aggregateQualities(qualities: QualitySummary[]): QualitySummary {
  const totalDocuments = qualities.reduce((s, q) => s + q.totalDocuments, 0);
  const affectedByOpenTasks = qualities.reduce((s, q) => s + q.affectedByOpenTasks, 0);
  const totalCurrent = qualities.reduce((s, q) => s + Math.round((q.percentCurrent / 100) * q.totalDocuments), 0);
  const percentCurrent = totalDocuments > 0 ? Math.round((totalCurrent / totalDocuments) * 100) : 0;
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

function aggregateTimesheets(timesheets: TimesheetSummary[]): TimesheetSummary {
  const allCostCodes = timesheets.flatMap((t) => t.costCodes);
  const totalBudgetedHours = timesheets.reduce((s, t) => s + t.totalBudgetedHours, 0);
  const totalSpentHours = timesheets.reduce((s, t) => s + t.totalSpentHours, 0);
  return {
    totalBudgetedHours,
    totalSpentHours,
    totalRemainingHours: timesheets.reduce((s, t) => s + t.totalRemainingHours, 0),
    totalCOHours: timesheets.reduce((s, t) => s + t.totalCOHours, 0),
    totalPCOHours: timesheets.reduce((s, t) => s + t.totalPCOHours, 0),
    percentUsed: Math.round((totalSpentHours / Math.max(1, totalBudgetedHours)) * 100),
    overspendCount: timesheets.reduce((s, t) => s + t.overspendCount, 0),
    costCodes: allCostCodes,
  };
}

function aggregateFunds(funds: FundSummary[]): FundSummary {
  return {
    totalCommitment: funds.reduce((s, f) => s + f.totalCommitment, 0),
    totalDrawn: funds.reduce((s, f) => s + f.totalDrawn, 0),
    totalRemaining: funds.reduce((s, f) => s + f.totalRemaining, 0),
    draws: funds.flatMap((f) => f.draws),
  };
}

function mergeOwnerLoads(loads: OwnerLoad[]): OwnerLoad[] {
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

async function getProjectDataAll(): Promise<ProjectData> {
  const projects = await prisma.project.findMany();
  const allData = await Promise.all(projects.map((p) => getProjectDataSingle(p.id)));

  return {
    tasks: allData.flatMap((d) => d.tasks),
    budget: aggregateBudgets(allData.map((d) => d.budget)),
    schedule: aggregateSchedules(allData.map((d) => d.schedule)),
    quality: aggregateQualities(allData.map((d) => d.quality)),
    criticalPath: {
      milestones: allData.flatMap((d) => d.criticalPath.milestones),
      activities: allData.flatMap((d) => d.criticalPath.activities),
    },
    timesheet: aggregateTimesheets(allData.map((d) => d.timesheet)),
    qaqc: {
      documents: allData.flatMap((d) => d.qaqc.documents),
      checklists: allData.flatMap((d) => d.qaqc.checklists),
    },
    repeatBreaches: allData.flatMap((d) => d.repeatBreaches),
    ownerLoads: mergeOwnerLoads(allData.flatMap((d) => d.ownerLoads)),
    invoicePatterns: allData.flatMap((d) => d.invoicePatterns),
    warranties: allData.flatMap((d) => d.warranties),
    devMilestones: allData.flatMap((d) => d.devMilestones),
    fund: aggregateFunds(allData.map((d) => d.fund)),
    leasing: allData.flatMap((d) => d.leasing),
    events: allData.flatMap((d) => d.events),
    pos: allData.flatMap((d) => d.pos),
    memberships: allData.flatMap((d) => d.memberships),
    finishes: allData.flatMap((d) => d.finishes),
  };
}

export async function getProjectData(projectId: string): Promise<ProjectData> {
  if (projectId === 'all') {
    return getProjectDataAll();
  }
  return getProjectDataSingle(projectId);
}

export async function getProjects() {
  return prisma.project.findMany();
}
