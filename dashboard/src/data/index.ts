import type { OpenTask, BudgetSummary, ScheduleSummary, QualitySummary, RepeatBreach, OwnerLoad, InvoicePattern, CriticalPathData, TimesheetSummary, QAQCData, WarrantyItem, DevMilestone, FundSummary, LeasingUnit, ShowroomEvent, POSItem, Membership, FinishSelection } from '@/lib/types';
import { aggregateBudgets, aggregateSchedules, aggregateQualities, mergeOwnerLoads } from '@/lib/aggregation';
import { ALL_PROJECTS_ID } from './mock-projects';

import { TASKS } from './mock-tasks';
import { TEAM } from './mock-team';
import { BUDGET } from './mock-budget';
import { SCHEDULE } from './mock-schedule';
import { QUALITY } from './mock-documents';
import { REPEAT_BREACHES, OWNER_LOADS, INVOICE_PATTERNS } from './mock-patterns';
import { GF_TASKS, GF_BUDGET, GF_SCHEDULE, GF_QUALITY, GF_REPEAT_BREACHES, GF_OWNER_LOADS, GF_INVOICE_PATTERNS } from './mock-greenfield';
import { SEED_COMMENTS } from './mock-comments';
import { VENDOR_BIDS, BID_MILESTONES } from './mock-bid-leveling';
import { CRITICAL_PATH, GF_CRITICAL_PATH } from './mock-critical-path';
import { TIMESHEET, GF_TIMESHEET } from './mock-timesheet';
import { QAQC_DATA, GF_QAQC_DATA } from './mock-qaqc';
import { SB_WARRANTIES, GF_WARRANTIES } from './mock-warranty';
import { SB_DEV_MILESTONES, GF_DEV_MILESTONES, SB_FUND, GF_FUND, SB_LEASING, SB_EVENTS, SB_POS, SB_MEMBERSHIPS } from './mock-business';
import { SB_FINISHES, GF_FINISHES } from './mock-design';

export { TEAM };
export { PROJECTS, ALL_PROJECTS_ID } from './mock-projects';
export { SEED_COMMENTS } from './mock-comments';
export { VENDOR_BIDS, BID_MILESTONES } from './mock-bid-leveling';

export interface ProjectData {
  tasks: OpenTask[];
  budget: BudgetSummary;
  schedule: ScheduleSummary;
  quality: QualitySummary;
  criticalPath: CriticalPathData;
  timesheet: TimesheetSummary;
  qaqc: QAQCData;
  repeatBreaches: RepeatBreach[];
  ownerLoads: OwnerLoad[];
  invoicePatterns: InvoicePattern[];
  warranties: WarrantyItem[];
  devMilestones: DevMilestone[];
  fund: FundSummary;
  leasing: LeasingUnit[];
  events: ShowroomEvent[];
  pos: POSItem[];
  memberships: Membership[];
  finishes: FinishSelection[];
}

const EMPTY_FUND: FundSummary = { totalCommitment: 0, totalDrawn: 0, totalRemaining: 0, draws: [] };

const PROJECT_DATA: Record<string, ProjectData> = {
  'sandbox-001': {
    tasks: TASKS,
    budget: BUDGET,
    schedule: SCHEDULE,
    quality: QUALITY,
    criticalPath: CRITICAL_PATH,
    timesheet: TIMESHEET,
    qaqc: QAQC_DATA,
    repeatBreaches: REPEAT_BREACHES,
    ownerLoads: OWNER_LOADS,
    invoicePatterns: INVOICE_PATTERNS,
    warranties: SB_WARRANTIES,
    devMilestones: SB_DEV_MILESTONES,
    fund: SB_FUND,
    leasing: SB_LEASING,
    events: SB_EVENTS,
    pos: SB_POS,
    memberships: SB_MEMBERSHIPS,
    finishes: SB_FINISHES,
  },
  'greenfield-002': {
    tasks: GF_TASKS,
    budget: GF_BUDGET,
    schedule: GF_SCHEDULE,
    quality: GF_QUALITY,
    criticalPath: GF_CRITICAL_PATH,
    timesheet: GF_TIMESHEET,
    qaqc: GF_QAQC_DATA,
    repeatBreaches: GF_REPEAT_BREACHES,
    ownerLoads: GF_OWNER_LOADS,
    invoicePatterns: GF_INVOICE_PATTERNS,
    warranties: GF_WARRANTIES,
    devMilestones: GF_DEV_MILESTONES,
    fund: GF_FUND,
    leasing: [],
    events: [],
    pos: [],
    memberships: [],
    finishes: GF_FINISHES,
  },
};

const ALL_PROJECT_IDS = Object.keys(PROJECT_DATA);

function aggregateTimesheets(timesheets: TimesheetSummary[]): TimesheetSummary {
  const allCostCodes = timesheets.flatMap((t) => t.costCodes);
  return {
    totalBudgetedHours: timesheets.reduce((s, t) => s + t.totalBudgetedHours, 0),
    totalSpentHours: timesheets.reduce((s, t) => s + t.totalSpentHours, 0),
    totalRemainingHours: timesheets.reduce((s, t) => s + t.totalRemainingHours, 0),
    totalCOHours: timesheets.reduce((s, t) => s + t.totalCOHours, 0),
    totalPCOHours: timesheets.reduce((s, t) => s + t.totalPCOHours, 0),
    percentUsed: Math.round(
      (timesheets.reduce((s, t) => s + t.totalSpentHours, 0) /
        Math.max(1, timesheets.reduce((s, t) => s + t.totalBudgetedHours, 0))) * 100,
    ),
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

export function getProjectData(projectId: string): ProjectData {
  if (projectId !== ALL_PROJECTS_ID) {
    const data = PROJECT_DATA[projectId];
    if (data) return data;
    // Fallback to aggregate if ID not found
  }

  // Aggregate all projects
  const allData = ALL_PROJECT_IDS.map((id) => PROJECT_DATA[id]);
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
