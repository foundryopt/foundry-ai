import type { QualityByType } from '@prisma/client';
import type { QualitySummary, DocumentType } from '../shared/types';

export function serializeQualitySummary(byTypes: QualityByType[]): QualitySummary {
  const totalDocuments = byTypes.reduce((s, bt) => s + bt.total, 0);
  const totalCurrent = byTypes.reduce((s, bt) => s + bt.current, 0);
  const affectedByOpenTasks = byTypes.reduce((s, bt) => s + bt.affectedByOpenTask, 0);
  const percentCurrent = totalDocuments > 0 ? Math.round((totalCurrent / totalDocuments) * 100) : 0;

  return {
    totalDocuments,
    percentCurrent,
    affectedByOpenTasks,
    byType: byTypes.map((bt) => ({
      type: bt.type as DocumentType,
      total: bt.total,
      current: bt.current,
      pendingReview: bt.pendingReview,
      revisionNeeded: bt.revisionNeeded,
      affectedByOpenTask: bt.affectedByOpenTask,
    })),
  };
}
