import type { Task } from '@prisma/client';
import type { OpenTask } from '../shared/types';

export function serializeTask(t: Task): OpenTask {
  return {
    id: t.id,
    projectId: t.projectId,
    category: t.category as OpenTask['category'],
    subject: t.subject,
    owner: t.owner,
    urgency: t.urgency as OpenTask['urgency'],
    daysOverdue: t.daysOverdue ?? undefined,
    daysUntilDue: t.daysUntilDue ?? undefined,
    slaDate: t.slaDate,
    createdDate: t.createdDate,
    source: t.source,
    deepLinks: t.deepLinks as unknown as OpenTask['deepLinks'],
    detail: t.detail as unknown as OpenTask['detail'],
    relatedTaskIds: (t.relatedTaskIds as unknown as string[]).length ? (t.relatedTaskIds as unknown as string[]) : undefined,
    costImpact: t.costImpact ?? undefined,
    scheduleImpactDays: t.scheduleImpactDays ?? undefined,
    qualityAffected: (t.qualityAffected as unknown as string[]).length ? (t.qualityAffected as unknown as string[]) : undefined,
    attachments: (t.attachments as unknown as any[]).length ? (t.attachments as unknown as OpenTask['attachments']) : undefined,
    costCodeRef: t.costCodeRef ?? undefined,
  };
}

export function serializeTasks(tasks: Task[]): OpenTask[] {
  return tasks.map(serializeTask);
}
