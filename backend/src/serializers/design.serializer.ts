import type { FinishSelection as PrismaFinish } from '@prisma/client';
import type { FinishSelection, RoomType, FinishCategory } from '../shared/types';

export function serializeFinish(f: PrismaFinish): FinishSelection {
  return {
    id: f.id,
    projectId: f.projectId,
    room: f.room as RoomType,
    category: f.category as FinishCategory,
    item: f.item,
    spec: f.spec,
    costCode: f.costCode,
    baseCost: f.baseCost,
    selectedUpgrade: f.selectedUpgrade ?? undefined,
    upgrades: f.upgrades as unknown as FinishSelection['upgrades'],
    imageUrl: f.imageUrl,
  };
}
