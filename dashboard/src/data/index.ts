import type { OpenTask, BudgetSummary, ScheduleSummary, QualitySummary, RepeatBreach, OwnerLoad, InvoicePattern } from '@/lib/types';
import { aggregateBudgets, aggregateSchedules, aggregateQualities, mergeOwnerLoads } from '@/lib/aggregation';
import { ALL_PROJECTS_ID } from './mock-projects';

import { TASKS } from './mock-tasks';
import { TEAM } from './mock-team';
import { BUDGET } from './mock-budget';
import { SCHEDULE } from './mock-schedule';
import { QUALITY } from './mock-documents';
import { REPEAT_BREACHES, OWNER_LOADS, INVOICE_PATTERNS } from './mock-patterns';
import { GF_TASKS, GF_BUDGET, GF_SCHEDULE, GF_QUALITY, GF_REPEAT_BREACHES, GF_OWNER_LOADS, GF_INVOICE_PATTERNS } from './mock-greenfield';

export { TEAM };
export { PROJECTS, ALL_PROJECTS_ID } from './mock-projects';

export interface ProjectData {
  tasks: OpenTask[];
  budget: BudgetSummary;
  schedule: ScheduleSummary;
  quality: QualitySummary;
  repeatBreaches: RepeatBreach[];
  ownerLoads: OwnerLoad[];
  invoicePatterns: InvoicePattern[];
}

const PROJECT_DATA: Record<string, ProjectData> = {
  'sandbox-001': {
    tasks: TASKS,
    budget: BUDGET,
    schedule: SCHEDULE,
    quality: QUALITY,
    repeatBreaches: REPEAT_BREACHES,
    ownerLoads: OWNER_LOADS,
    invoicePatterns: INVOICE_PATTERNS,
  },
  'greenfield-002': {
    tasks: GF_TASKS,
    budget: GF_BUDGET,
    schedule: GF_SCHEDULE,
    quality: GF_QUALITY,
    repeatBreaches: GF_REPEAT_BREACHES,
    ownerLoads: GF_OWNER_LOADS,
    invoicePatterns: GF_INVOICE_PATTERNS,
  },
};

const ALL_PROJECT_IDS = Object.keys(PROJECT_DATA);

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
    repeatBreaches: allData.flatMap((d) => d.repeatBreaches),
    ownerLoads: mergeOwnerLoads(allData.flatMap((d) => d.ownerLoads)),
    invoicePatterns: allData.flatMap((d) => d.invoicePatterns),
  };
}
