import type { QAQCDocument as PrismaDoc, QCChecklist as PrismaChecklist } from '@prisma/client';
import type { QAQCData, QAQCDocument, QCChecklist, QADocType, QADocStatus } from '../shared/types';

export function serializeQAQCDocument(d: PrismaDoc): QAQCDocument {
  return {
    id: d.id,
    projectId: d.projectId,
    type: d.type as QADocType,
    title: d.title,
    costCode: d.costCode,
    trade: d.trade,
    revision: d.revision,
    status: d.status as QADocStatus,
    lastUpdated: d.lastUpdated,
    linkedTaskIds: d.linkedTaskIds as string[],
    fieldwireUrl: d.fieldwireUrl ?? undefined,
    fileUrl: d.fileUrl,
  };
}

export function serializeQCChecklist(c: PrismaChecklist): QCChecklist {
  return {
    id: c.id,
    projectId: c.projectId,
    costCode: c.costCode,
    trade: c.trade,
    activity: c.activity,
    location: c.location,
    items: c.items as unknown as QCChecklist['items'],
    overallStatus: c.overallStatus as QCChecklist['overallStatus'],
    linkedTaskIds: c.linkedTaskIds as string[],
  };
}

export function serializeQAQCData(docs: PrismaDoc[], checklists: PrismaChecklist[]): QAQCData {
  return {
    documents: docs.map(serializeQAQCDocument),
    checklists: checklists.map(serializeQCChecklist),
  };
}
