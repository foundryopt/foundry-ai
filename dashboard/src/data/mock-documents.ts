import type { QualitySummary } from '@/lib/types';

export const QUALITY: QualitySummary = {
  totalDocuments: 186,
  percentCurrent: 92,
  affectedByOpenTasks: 8,
  byType: [
    {
      type: 'Drawing',
      total: 94,
      current: 86,
      pendingReview: 3,
      revisionNeeded: 2,
      affectedByOpenTask: 3,
    },
    {
      type: 'Spec',
      total: 38,
      current: 36,
      pendingReview: 1,
      revisionNeeded: 0,
      affectedByOpenTask: 1,
    },
    {
      type: 'Submittal',
      total: 32,
      current: 28,
      pendingReview: 2,
      revisionNeeded: 0,
      affectedByOpenTask: 2,
    },
    {
      type: 'QC',
      total: 22,
      current: 20,
      pendingReview: 0,
      revisionNeeded: 0,
      affectedByOpenTask: 2,
    },
  ],
};
