import type { SchedulePhase as PrismaPhase } from '@prisma/client';
import type { SchedulePhase, ScheduleSummary } from '../shared/types';

export function serializeSchedulePhase(p: PrismaPhase): SchedulePhase {
  return {
    id: p.id,
    name: p.name,
    startDate: p.startDate,
    endDate: p.endDate,
    percentComplete: p.percentComplete,
    plannedPercent: p.plannedPercent,
    daysVariance: p.daysVariance,
    linkedTaskIds: p.linkedTaskIds as string[],
    potentialImpactDays: p.potentialImpactDays,
  };
}

export function serializeScheduleSummary(phases: PrismaPhase[]): ScheduleSummary {
  const serialized = phases.map(serializeSchedulePhase);

  let overallStatus: ScheduleSummary['overallStatus'] = 'on-track';
  for (const p of serialized) {
    if (p.daysVariance < -5) { overallStatus = 'behind'; break; }
    if (p.daysVariance < 0) overallStatus = 'at-risk';
  }

  return {
    totalPhases: serialized.length,
    overallStatus,
    phases: serialized,
  };
}
