import type {
  CriticalPathMilestone as PrismaMilestone,
  MilestoneActivity as PrismaActivity,
} from '@prisma/client';
import type { CriticalPathData, MilestonePhase, Role } from '../shared/types';

export function serializeCriticalPath(
  milestones: PrismaMilestone[],
  activities: PrismaActivity[],
): CriticalPathData {
  return {
    milestones: milestones.map((m) => ({
      phase: m.phase as MilestonePhase,
      startDate: m.startDate,
      endDate: m.endDate,
      percentComplete: m.percentComplete,
      status: m.status as 'completed' | 'in-progress' | 'upcoming' | 'at-risk',
    })),
    activities: activities.map((a) => ({
      id: a.id,
      milestonePhase: a.milestonePhase as MilestonePhase,
      costCode: a.costCode,
      trade: a.trade,
      description: a.description,
      owner: a.owner,
      role: a.role as Role,
      startDate: a.startDate,
      endDate: a.endDate,
      percentComplete: a.percentComplete,
      status: a.status as 'completed' | 'in-progress' | 'upcoming' | 'at-risk',
      linkedTaskIds: a.linkedTaskIds as string[],
    })),
  };
}
