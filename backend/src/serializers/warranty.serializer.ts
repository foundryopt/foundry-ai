import type { WarrantyItem as PrismaWarranty, WarrantyClaim as PrismaClaim } from '@prisma/client';
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

export interface SerializedWarrantyClaim {
  id: string;
  claimNumber: string;
  projectId: string;
  unitLocation: string;
  reportedBy: string;
  reportedByEmail: string | null;
  reportedByPhone: string | null;
  dateReported: Date;
  priority: string;
  status: string;
  defectDescription: string;
  category: string;
  photoEvidence: boolean;
  warrantyItemRef: string | null;
  warrantyExpiry: Date | null;
  covered: string;
  responsibleContractor: string | null;
  dateAssigned: Date | null;
  responseDue: Date | null;
  dateContractorResponded: Date | null;
  dateRepairScheduled: Date | null;
  dateRepairCompleted: Date | null;
  repairDescription: string | null;
  repairVerified: boolean;
  dateClosed: Date | null;
  escalationHistory: string | null;
  notes: string | null;

  // Signoff fields
  pmSignoff: boolean;
  pmSignoffDate: Date | null;
  pmSignoffBy: string | null;
  gcSignoff: boolean;
  gcSignoffDate: Date | null;
  gcSignoffBy: string | null;
  beforePhotosUrl: string | null;
  afterPhotosUrl: string | null;
  repairSignoff: boolean;
  repairSignoffDate: Date | null;
  repairSignoffBy: string | null;
  homeownerSignoff: boolean;
  homeownerSignoffDate: Date | null;
  homeownerSignoffSent: Date | null;
  homeownerSignoffMethod: string | null;
  homeownerSignoffNotes: string | null;
  closeSignoff: boolean;
  closeSignoffDate: Date | null;
  closeSignoffBy: string | null;

  // GHL fields
  ghlContactId: string | null;
  ghlConversationId: string | null;
  intakeSource: string;

  createdAt: Date;
  updatedAt: Date;

  // Computed fields
  signoffProgress: {
    current: number;
    total: number;
    gates: { name: string; complete: boolean; date: Date | null; by: string | null }[];
  };
}

export function serializeWarrantyClaim(claim: PrismaClaim): SerializedWarrantyClaim {
  const gates = [
    { name: 'PM Intake', complete: claim.pmSignoff, date: claim.pmSignoffDate, by: claim.pmSignoffBy },
    { name: 'GC Assignment', complete: claim.gcSignoff, date: claim.gcSignoffDate, by: claim.gcSignoffBy },
    { name: 'Repair Verification', complete: claim.repairSignoff, date: claim.repairSignoffDate, by: claim.repairSignoffBy },
    { name: 'Homeowner Signoff', complete: claim.homeownerSignoff, date: claim.homeownerSignoffDate, by: claim.homeownerSignoffMethod },
    { name: 'Closure', complete: claim.closeSignoff, date: claim.closeSignoffDate, by: claim.closeSignoffBy },
  ];

  return {
    id: claim.id,
    claimNumber: claim.claimNumber,
    projectId: claim.projectId,
    unitLocation: claim.unitLocation,
    reportedBy: claim.reportedBy,
    reportedByEmail: claim.reportedByEmail,
    reportedByPhone: claim.reportedByPhone,
    dateReported: claim.dateReported,
    priority: claim.priority,
    status: claim.status,
    defectDescription: claim.defectDescription,
    category: claim.category,
    photoEvidence: claim.photoEvidence,
    warrantyItemRef: claim.warrantyItemRef,
    warrantyExpiry: claim.warrantyExpiry,
    covered: claim.covered,
    responsibleContractor: claim.responsibleContractor,
    dateAssigned: claim.dateAssigned,
    responseDue: claim.responseDue,
    dateContractorResponded: claim.dateContractorResponded,
    dateRepairScheduled: claim.dateRepairScheduled,
    dateRepairCompleted: claim.dateRepairCompleted,
    repairDescription: claim.repairDescription,
    repairVerified: claim.repairVerified,
    dateClosed: claim.dateClosed,
    escalationHistory: claim.escalationHistory,
    notes: claim.notes,

    pmSignoff: claim.pmSignoff,
    pmSignoffDate: claim.pmSignoffDate,
    pmSignoffBy: claim.pmSignoffBy,
    gcSignoff: claim.gcSignoff,
    gcSignoffDate: claim.gcSignoffDate,
    gcSignoffBy: claim.gcSignoffBy,
    beforePhotosUrl: claim.beforePhotosUrl,
    afterPhotosUrl: claim.afterPhotosUrl,
    repairSignoff: claim.repairSignoff,
    repairSignoffDate: claim.repairSignoffDate,
    repairSignoffBy: claim.repairSignoffBy,
    homeownerSignoff: claim.homeownerSignoff,
    homeownerSignoffDate: claim.homeownerSignoffDate,
    homeownerSignoffSent: claim.homeownerSignoffSent,
    homeownerSignoffMethod: claim.homeownerSignoffMethod,
    homeownerSignoffNotes: claim.homeownerSignoffNotes,
    closeSignoff: claim.closeSignoff,
    closeSignoffDate: claim.closeSignoffDate,
    closeSignoffBy: claim.closeSignoffBy,

    ghlContactId: claim.ghlContactId,
    ghlConversationId: claim.ghlConversationId,
    intakeSource: claim.intakeSource,

    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,

    signoffProgress: {
      current: gates.filter(g => g.complete).length,
      total: gates.length,
      gates,
    },
  };
}
