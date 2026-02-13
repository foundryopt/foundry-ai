import type { WarrantyItem as PrismaWarranty } from '@prisma/client';
import type { WarrantyItem, WarrantySeverity, WarrantyStatus } from '../shared/types';

export function serializeWarranty(w: PrismaWarranty): WarrantyItem {
  return {
    id: w.id,
    projectId: w.projectId,
    unit: w.unit,
    issueType: w.issueType,
    description: w.description,
    reportedDate: w.reportedDate,
    severity: w.severity as WarrantySeverity,
    status: w.status as WarrantyStatus,
    assignedTo: w.assignedTo,
    trade: w.trade,
    costCode: w.costCode,
    warrantyEnd: w.warrantyEnd,
    resolution: w.resolution ?? undefined,
    resolvedDate: w.resolvedDate ?? undefined,
    linkedTaskIds: w.linkedTaskIds as string[],
  };
}
