import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { serializeWarranty, serializeWarrantyClaim } from '../serializers/warranty.serializer';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// ══════════════════════════════════════════════════════════════
// Legacy Warranty Items (existing functionality)
// ══════════════════════════════════════════════════════════════

// GET /api/warranty/:projectId — List warranty items for a project
router.get('/:projectId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.warrantyItem.findMany({
      where: { projectId: req.params.projectId },
    });
    res.json(items.map(serializeWarranty));
  } catch (err) { next(err); }
});

// ══════════════════════════════════════════════════════════════
// Warranty Claims — Full GHL Integration with Signoff Protocol
// ══════════════════════════════════════════════════════════════

// Generate next claim number for a project
async function generateClaimNumber(projectId: string): Promise<string> {
  const projectCode = projectId.toUpperCase().slice(0, 3);
  const count = await prisma.warrantyClaim.count({
    where: { projectId },
  });
  return `WC-${projectCode}-${String(count + 1).padStart(3, '0')}`;
}

// GET /api/warranty/claims/all — List all warranty claims (admin)
router.get('/claims/all', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, projectId, priority, limit = '50', offset = '0' } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    if (priority) where.priority = priority;

    const [claims, total] = await Promise.all([
      prisma.warrantyClaim.findMany({
        where,
        orderBy: { dateReported: 'desc' },
        take: parseInt(limit as string, 10),
        skip: parseInt(offset as string, 10),
      }),
      prisma.warrantyClaim.count({ where }),
    ]);

    res.json({
      claims: claims.map(serializeWarrantyClaim),
      total,
      limit: parseInt(limit as string, 10),
      offset: parseInt(offset as string, 10),
    });
  } catch (err) { next(err); }
});

// GET /api/warranty/claims/project/:projectId — List claims for a project
router.get('/claims/project/:projectId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claims = await prisma.warrantyClaim.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { dateReported: 'desc' },
    });
    res.json(claims.map(serializeWarrantyClaim));
  } catch (err) { next(err); }
});

// GET /api/warranty/claims/:claimNumber — Get single claim by claim number
router.get('/claims/:claimNumber', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await prisma.warrantyClaim.findUnique({
      where: { claimNumber: req.params.claimNumber },
    });
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const activities = await prisma.warrantyClaimActivity.findMany({
      where: { claimId: claim.id },
      orderBy: { performedAt: 'desc' },
    });

    res.json({
      ...serializeWarrantyClaim(claim),
      activities,
    });
  } catch (err) { next(err); }
});

// POST /api/warranty/claims — Create new warranty claim
router.post('/claims', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      projectId,
      unitLocation,
      reportedBy,
      reportedByEmail,
      reportedByPhone,
      priority = 'standard',
      defectDescription,
      category,
      photoEvidence = false,
      warrantyItemRef,
      warrantyExpiry,
      intakeSource = 'manual',
      ghlContactId,
    } = req.body;

    const claimNumber = await generateClaimNumber(projectId);

    const claim = await prisma.warrantyClaim.create({
      data: {
        claimNumber,
        projectId,
        unitLocation,
        reportedBy,
        reportedByEmail,
        reportedByPhone,
        dateReported: new Date(),
        priority,
        status: 'open',
        defectDescription,
        category,
        photoEvidence,
        warrantyItemRef,
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
        intakeSource,
        ghlContactId,
      },
    });

    await prisma.warrantyClaimActivity.create({
      data: {
        claimId: claim.id,
        action: 'created',
        description: `Claim ${claimNumber} created via ${intakeSource}`,
        performedBy: (req as any).user?.name || 'system',
        metadata: { intakeSource, priority, category },
      },
    });

    res.status(201).json(serializeWarrantyClaim(claim));
  } catch (err) { next(err); }
});

// PATCH /api/warranty/claims/:claimNumber — Update warranty claim
router.patch('/claims/:claimNumber', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await prisma.warrantyClaim.findUnique({
      where: { claimNumber: req.params.claimNumber },
    });
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const allowedFields = [
      'status', 'responsibleContractor', 'dateAssigned', 'responseDue',
      'dateContractorResponded', 'dateRepairScheduled', 'dateRepairCompleted',
      'repairDescription', 'repairVerified', 'escalationHistory', 'notes',
      'beforePhotosUrl', 'afterPhotosUrl', 'covered',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field.startsWith('date') && req.body[field]) {
          updates[field] = new Date(req.body[field]);
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    const updated = await prisma.warrantyClaim.update({
      where: { claimNumber: req.params.claimNumber },
      data: updates,
    });

    await prisma.warrantyClaimActivity.create({
      data: {
        claimId: claim.id,
        action: 'updated',
        description: `Claim updated: ${Object.keys(updates).join(', ')}`,
        performedBy: (req as any).user?.name || 'system',
        metadata: updates as any,
      },
    });

    res.json(serializeWarrantyClaim(updated));
  } catch (err) { next(err); }
});

// ══════════════════════════════════════════════════════════════
// Signoff Endpoints — Gate Protocol
// ══════════════════════════════════════════════════════════════

// POST /api/warranty/claims/:claimNumber/signoff/pm — PM Intake Signoff (Gate 1)
router.post('/claims/:claimNumber/signoff/pm', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await prisma.warrantyClaim.findUnique({
      where: { claimNumber: req.params.claimNumber },
    });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (claim.pmSignoff) return res.status(400).json({ error: 'PM signoff already complete' });

    const updated = await prisma.warrantyClaim.update({
      where: { claimNumber: req.params.claimNumber },
      data: {
        pmSignoff: true,
        pmSignoffDate: new Date(),
        pmSignoffBy: (req as any).user?.name,
        covered: req.body.covered || 'covered',
      },
    });

    await prisma.warrantyClaimActivity.create({
      data: {
        claimId: claim.id,
        action: 'signoff',
        description: `PM intake signoff completed by ${(req as any).user?.name}`,
        performedBy: (req as any).user?.name || 'system',
        metadata: { gate: 'pm', covered: req.body.covered },
      },
    });

    res.json(serializeWarrantyClaim(updated));
  } catch (err) { next(err); }
});

// POST /api/warranty/claims/:claimNumber/signoff/gc — GC Assignment Signoff (Gate 2)
router.post('/claims/:claimNumber/signoff/gc', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await prisma.warrantyClaim.findUnique({
      where: { claimNumber: req.params.claimNumber },
    });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (!claim.pmSignoff) return res.status(400).json({ error: 'PM signoff required first' });
    if (claim.gcSignoff) return res.status(400).json({ error: 'GC signoff already complete' });

    const { responsibleContractor, responseDue } = req.body;
    if (!responsibleContractor) {
      return res.status(400).json({ error: 'Responsible contractor required' });
    }

    const updated = await prisma.warrantyClaim.update({
      where: { claimNumber: req.params.claimNumber },
      data: {
        gcSignoff: true,
        gcSignoffDate: new Date(),
        gcSignoffBy: (req as any).user?.name,
        responsibleContractor,
        dateAssigned: new Date(),
        responseDue: responseDue ? new Date(responseDue) : null,
        status: 'assigned',
      },
    });

    await prisma.warrantyClaimActivity.create({
      data: {
        claimId: claim.id,
        action: 'signoff',
        description: `GC assignment signoff: ${responsibleContractor}`,
        performedBy: (req as any).user?.name || 'system',
        metadata: { gate: 'gc', responsibleContractor },
      },
    });

    res.json(serializeWarrantyClaim(updated));
  } catch (err) { next(err); }
});

// POST /api/warranty/claims/:claimNumber/photos — Upload Before/After Photos (Gate 3)
router.post('/claims/:claimNumber/photos', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await prisma.warrantyClaim.findUnique({
      where: { claimNumber: req.params.claimNumber },
    });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    const { beforePhotosUrl, afterPhotosUrl } = req.body;
    const updates: Record<string, string> = {};
    if (beforePhotosUrl) updates.beforePhotosUrl = beforePhotosUrl;
    if (afterPhotosUrl) updates.afterPhotosUrl = afterPhotosUrl;

    const updated = await prisma.warrantyClaim.update({
      where: { claimNumber: req.params.claimNumber },
      data: updates,
    });

    await prisma.warrantyClaimActivity.create({
      data: {
        claimId: claim.id,
        action: 'photo_upload',
        description: `Photos uploaded: ${Object.keys(updates).join(', ')}`,
        performedBy: (req as any).user?.name || 'system',
        metadata: updates as any,
      },
    });

    res.json(serializeWarrantyClaim(updated));
  } catch (err) { next(err); }
});

// POST /api/warranty/claims/:claimNumber/signoff/repair — Repair Signoff (Gate 4)
router.post('/claims/:claimNumber/signoff/repair', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await prisma.warrantyClaim.findUnique({
      where: { claimNumber: req.params.claimNumber },
    });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (!claim.gcSignoff) return res.status(400).json({ error: 'GC signoff required first' });
    if (!claim.beforePhotosUrl || !claim.afterPhotosUrl) {
      return res.status(400).json({ error: 'Before and after photos required' });
    }
    if (claim.repairSignoff) return res.status(400).json({ error: 'Repair signoff already complete' });

    const { repairDescription, dateRepairCompleted } = req.body;

    const updated = await prisma.warrantyClaim.update({
      where: { claimNumber: req.params.claimNumber },
      data: {
        repairSignoff: true,
        repairSignoffDate: new Date(),
        repairSignoffBy: (req as any).user?.name,
        repairVerified: true,
        repairDescription,
        dateRepairCompleted: dateRepairCompleted ? new Date(dateRepairCompleted) : new Date(),
        status: 'resolved',
      },
    });

    await prisma.warrantyClaimActivity.create({
      data: {
        claimId: claim.id,
        action: 'signoff',
        description: `Repair signoff completed`,
        performedBy: (req as any).user?.name || 'system',
        metadata: { gate: 'repair', repairDescription },
      },
    });

    res.json(serializeWarrantyClaim(updated));
  } catch (err) { next(err); }
});

// POST /api/warranty/claims/:claimNumber/signoff/homeowner/send — Send Homeowner Signoff Request (Gate 5)
router.post('/claims/:claimNumber/signoff/homeowner/send', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await prisma.warrantyClaim.findUnique({
      where: { claimNumber: req.params.claimNumber },
    });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (!claim.repairSignoff) return res.status(400).json({ error: 'Repair signoff required first' });

    const updated = await prisma.warrantyClaim.update({
      where: { claimNumber: req.params.claimNumber },
      data: {
        homeownerSignoffSent: new Date(),
      },
    });

    await prisma.warrantyClaimActivity.create({
      data: {
        claimId: claim.id,
        action: 'homeowner_signoff_sent',
        description: `Homeowner signoff request sent`,
        performedBy: (req as any).user?.name || 'system',
        metadata: { sentTo: claim.reportedByEmail },
      },
    });

    res.json({
      ...serializeWarrantyClaim(updated),
      signoffUrl: `/warranty/signoff/${claim.claimNumber}`,
    });
  } catch (err) { next(err); }
});

// POST /api/warranty/claims/:claimNumber/signoff/homeowner — Homeowner Signoff (Gate 5)
router.post('/claims/:claimNumber/signoff/homeowner', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await prisma.warrantyClaim.findUnique({
      where: { claimNumber: req.params.claimNumber },
    });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (!claim.homeownerSignoffSent) return res.status(400).json({ error: 'Signoff request not sent yet' });
    if (claim.homeownerSignoff) return res.status(400).json({ error: 'Already signed off' });

    const { satisfied, issueDescription, signature } = req.body;

    if (satisfied === false && issueDescription) {
      const updated = await prisma.warrantyClaim.update({
        where: { claimNumber: req.params.claimNumber },
        data: {
          homeownerSignoffMethod: 'reopened',
          homeownerSignoffNotes: issueDescription,
          status: 'in-repair',
        },
      });

      await prisma.warrantyClaimActivity.create({
        data: {
          claimId: claim.id,
          action: 'homeowner_rejected',
          description: `Homeowner rejected repair: ${issueDescription}`,
          performedBy: claim.reportedBy,
          metadata: { issueDescription },
        },
      });

      return res.json(serializeWarrantyClaim(updated));
    }

    const updated = await prisma.warrantyClaim.update({
      where: { claimNumber: req.params.claimNumber },
      data: {
        homeownerSignoff: true,
        homeownerSignoffDate: new Date(),
        homeownerSignoffMethod: 'signed',
        homeownerSignoffNotes: signature ? 'Digital signature received' : null,
      },
    });

    await prisma.warrantyClaimActivity.create({
      data: {
        claimId: claim.id,
        action: 'signoff',
        description: `Homeowner signoff completed`,
        performedBy: claim.reportedBy,
        metadata: { gate: 'homeowner', method: 'signed' },
      },
    });

    res.json(serializeWarrantyClaim(updated));
  } catch (err) { next(err); }
});

// POST /api/warranty/claims/:claimNumber/signoff/homeowner/auto — Auto-Approve after 24 hours (Gate 5)
router.post('/claims/:claimNumber/signoff/homeowner/auto', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await prisma.warrantyClaim.findUnique({
      where: { claimNumber: req.params.claimNumber },
    });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (!claim.homeownerSignoffSent) return res.status(400).json({ error: 'Signoff request not sent yet' });
    if (claim.homeownerSignoff) return res.status(400).json({ error: 'Already signed off' });

    const sentAt = new Date(claim.homeownerSignoffSent);
    const now = new Date();
    const hoursSinceSent = (now.getTime() - sentAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceSent < 24) {
      return res.status(400).json({
        error: 'Cannot auto-approve before 24 hours',
        hoursRemaining: Math.ceil(24 - hoursSinceSent),
      });
    }

    const updated = await prisma.warrantyClaim.update({
      where: { claimNumber: req.params.claimNumber },
      data: {
        homeownerSignoff: true,
        homeownerSignoffDate: new Date(),
        homeownerSignoffMethod: 'auto-approved',
        homeownerSignoffNotes: 'Auto-approved: no response within 24 hours',
      },
    });

    await prisma.warrantyClaimActivity.create({
      data: {
        claimId: claim.id,
        action: 'signoff',
        description: `Homeowner signoff auto-approved (no response in 24 hours)`,
        performedBy: (req as any).user?.name || 'system',
        metadata: { gate: 'homeowner', method: 'auto-approved' },
      },
    });

    res.json(serializeWarrantyClaim(updated));
  } catch (err) { next(err); }
});

// POST /api/warranty/claims/:claimNumber/signoff/close — Closure Signoff (Gate 6)
router.post('/claims/:claimNumber/signoff/close', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim = await prisma.warrantyClaim.findUnique({
      where: { claimNumber: req.params.claimNumber },
    });
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (!claim.homeownerSignoff && claim.covered !== 'excluded') {
      return res.status(400).json({ error: 'Homeowner signoff required first (unless excluded)' });
    }
    if (claim.closeSignoff) return res.status(400).json({ error: 'Already closed' });

    const updated = await prisma.warrantyClaim.update({
      where: { claimNumber: req.params.claimNumber },
      data: {
        closeSignoff: true,
        closeSignoffDate: new Date(),
        closeSignoffBy: (req as any).user?.name,
        dateClosed: new Date(),
        status: 'closed',
      },
    });

    await prisma.warrantyClaimActivity.create({
      data: {
        claimId: claim.id,
        action: 'signoff',
        description: `Closure signoff completed`,
        performedBy: (req as any).user?.name || 'system',
        metadata: { gate: 'close' },
      },
    });

    res.json(serializeWarrantyClaim(updated));
  } catch (err) { next(err); }
});

// ══════════════════════════════════════════════════════════════
// Public Status Lookup (for www.shb.studio/warranty/status)
// ══════════════════════════════════════════════════════════════

// GET /api/warranty/public/status — Lookup claim status (public endpoint)
router.get('/public/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { claimNumber, email } = req.query;

    if (!claimNumber && !email) {
      return res.status(400).json({ error: 'Claim number or email required' });
    }

    const where: Record<string, unknown> = {};
    if (claimNumber) where.claimNumber = claimNumber;
    if (email) where.reportedByEmail = email;

    const claims = await prisma.warrantyClaim.findMany({ where });

    if (claims.length === 0) {
      return res.status(404).json({ error: 'No claims found' });
    }

    const publicClaims = claims.map(claim => ({
      claimNumber: claim.claimNumber,
      dateReported: claim.dateReported,
      status: claim.status,
      statusFriendly: getStatusFriendly(claim.status),
      category: claim.category,
      nextStep: getNextStep(claim),
      beforePhotosUrl: claim.repairSignoff ? claim.beforePhotosUrl : null,
      afterPhotosUrl: claim.repairSignoff ? claim.afterPhotosUrl : null,
      signoffUrl: claim.homeownerSignoffSent && !claim.homeownerSignoff
        ? `/warranty/signoff/${claim.claimNumber}`
        : null,
    }));

    res.json({ claims: publicClaims });
  } catch (err) { next(err); }
});

function getStatusFriendly(status: string): string {
  const map: Record<string, string> = {
    'open': 'Under Review',
    'assigned': 'Contractor Assigned',
    'in-repair': 'Repair In Progress',
    'resolved': 'Awaiting Confirmation',
    'closed': 'Completed',
    'disputed': 'Under Investigation',
  };
  return map[status] || status;
}

function getNextStep(claim: {
  status: string;
  pmSignoff: boolean;
  gcSignoff: boolean;
  repairSignoff: boolean;
  homeownerSignoff: boolean;
  homeownerSignoffSent: Date | null;
}): string {
  if (!claim.pmSignoff) return 'Awaiting initial review';
  if (!claim.gcSignoff) return 'Awaiting contractor assignment';
  if (claim.status === 'assigned') return 'Awaiting contractor response';
  if (claim.status === 'in-repair' && !claim.repairSignoff) return 'Repair in progress';
  if (claim.repairSignoff && !claim.homeownerSignoffSent) return 'Preparing confirmation request';
  if (claim.homeownerSignoffSent && !claim.homeownerSignoff) return 'Awaiting your confirmation';
  if (claim.homeownerSignoff) return 'Awaiting final closure';
  return 'Processing';
}

// ══════════════════════════════════════════════════════════════
// GHL Webhook Endpoint
// ══════════════════════════════════════════════════════════════

// POST /api/warranty/webhook/ghl — GHL Form Submission Webhook
router.post('/webhook/ghl', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      contact_id,
      full_name,
      email,
      phone,
      unit_location,
      issue_description,
      category,
      is_emergency,
      photo_url,
    } = req.body;

    const projectId = req.body.project_id || 'belmont';
    const claimNumber = await generateClaimNumber(projectId);

    const claim = await prisma.warrantyClaim.create({
      data: {
        claimNumber,
        projectId,
        unitLocation: unit_location || 'Not specified',
        reportedBy: full_name || 'Unknown',
        reportedByEmail: email,
        reportedByPhone: phone,
        dateReported: new Date(),
        priority: is_emergency === 'yes' || is_emergency === true ? 'emergency' : 'standard',
        status: 'open',
        defectDescription: issue_description || 'No description provided',
        category: category || 'general',
        photoEvidence: !!photo_url,
        intakeSource: 'ghl-form',
        ghlContactId: contact_id,
      },
    });

    await prisma.warrantyClaimActivity.create({
      data: {
        claimId: claim.id,
        action: 'created',
        description: `Claim created via GHL form submission`,
        performedBy: 'GHL Webhook',
        metadata: { contactId: contact_id, email },
      },
    });

    res.status(201).json({
      success: true,
      claimNumber: claim.claimNumber,
      message: `Warranty claim ${claim.claimNumber} created successfully`,
    });
  } catch (err) { next(err); }
});

// POST /api/warranty/webhook/ghl/signoff — GHL Homeowner Signoff Form Webhook
router.post('/webhook/ghl/signoff', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { claim_number, satisfied, issue_description, signature } = req.body;

    const claim = await prisma.warrantyClaim.findUnique({
      where: { claimNumber: claim_number },
    });

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    if (satisfied === 'no' || satisfied === false) {
      await prisma.warrantyClaim.update({
        where: { claimNumber: claim_number },
        data: {
          homeownerSignoffMethod: 'reopened',
          homeownerSignoffNotes: issue_description,
          status: 'in-repair',
        },
      });

      await prisma.warrantyClaimActivity.create({
        data: {
          claimId: claim.id,
          action: 'homeowner_rejected',
          description: `Homeowner rejected repair via GHL: ${issue_description}`,
          performedBy: claim.reportedBy,
          metadata: { source: 'ghl', issueDescription: issue_description },
        },
      });

      return res.json({ success: true, status: 'reopened' });
    }

    await prisma.warrantyClaim.update({
      where: { claimNumber: claim_number },
      data: {
        homeownerSignoff: true,
        homeownerSignoffDate: new Date(),
        homeownerSignoffMethod: 'signed',
        homeownerSignoffNotes: signature ? 'Digital signature received via GHL' : null,
      },
    });

    await prisma.warrantyClaimActivity.create({
      data: {
        claimId: claim.id,
        action: 'signoff',
        description: `Homeowner signoff completed via GHL`,
        performedBy: claim.reportedBy,
        metadata: { gate: 'homeowner', method: 'signed', source: 'ghl' },
      },
    });

    res.json({ success: true, status: 'signed' });
  } catch (err) { next(err); }
});

// ══════════════════════════════════════════════════════════════
// Metrics & Reporting
// ══════════════════════════════════════════════════════════════

// GET /api/warranty/claims/metrics — Dashboard metrics
router.get('/claims/metrics', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;
    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;

    const [
      totalOpen,
      totalAssigned,
      totalInRepair,
      totalResolved,
      totalClosed,
      avgResolutionTime,
      byCategory,
      byContractor,
      pendingSignoffs,
    ] = await Promise.all([
      prisma.warrantyClaim.count({ where: { ...where, status: 'open' } }),
      prisma.warrantyClaim.count({ where: { ...where, status: 'assigned' } }),
      prisma.warrantyClaim.count({ where: { ...where, status: 'in-repair' } }),
      prisma.warrantyClaim.count({ where: { ...where, status: 'resolved' } }),
      prisma.warrantyClaim.count({ where: { ...where, status: 'closed' } }),
      prisma.$queryRaw`
        SELECT AVG(EXTRACT(EPOCH FROM (date_closed - date_reported)) / 86400) as avg_days
        FROM warranty_claims
        WHERE date_closed IS NOT NULL
        ${projectId ? prisma.$queryRaw`AND project_id = ${projectId}` : prisma.$queryRaw``}
      `,
      prisma.warrantyClaim.groupBy({
        by: ['category'],
        _count: { id: true },
        where,
      }),
      prisma.warrantyClaim.groupBy({
        by: ['responsibleContractor'],
        _count: { id: true },
        where: { ...where, responsibleContractor: { not: null } },
      }),
      prisma.warrantyClaim.count({
        where: {
          ...where,
          OR: [
            { pmSignoff: false, status: 'open' },
            { gcSignoff: false, pmSignoff: true, status: { in: ['open', 'assigned'] } },
            { repairSignoff: false, status: 'in-repair' },
            { homeownerSignoff: false, homeownerSignoffSent: { not: null } },
            { closeSignoff: false, homeownerSignoff: true },
          ],
        },
      }),
    ]);

    res.json({
      summary: {
        open: totalOpen,
        assigned: totalAssigned,
        inRepair: totalInRepair,
        resolved: totalResolved,
        closed: totalClosed,
        total: totalOpen + totalAssigned + totalInRepair + totalResolved + totalClosed,
        pendingSignoffs,
      },
      avgResolutionDays: (avgResolutionTime as any)?.[0]?.avg_days || null,
      byCategory: byCategory.map(c => ({ category: c.category, count: c._count.id })),
      byContractor: byContractor.map(c => ({
        contractor: c.responsibleContractor,
        count: c._count.id,
      })),
    });
  } catch (err) { next(err); }
});

// GET /api/warranty/claims/signoff-status — Signoff completion report
router.get('/claims/signoff-status', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;
    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;

    const [pmComplete, gcComplete, repairComplete, homeownerComplete, closeComplete, total] = await Promise.all([
      prisma.warrantyClaim.count({ where: { ...where, pmSignoff: true } }),
      prisma.warrantyClaim.count({ where: { ...where, gcSignoff: true } }),
      prisma.warrantyClaim.count({ where: { ...where, repairSignoff: true } }),
      prisma.warrantyClaim.count({ where: { ...where, homeownerSignoff: true } }),
      prisma.warrantyClaim.count({ where: { ...where, closeSignoff: true } }),
      prisma.warrantyClaim.count({ where }),
    ]);

    res.json({
      gates: [
        { gate: 'PM Intake', complete: pmComplete, total, percentage: total ? Math.round((pmComplete / total) * 100) : 0 },
        { gate: 'GC Assignment', complete: gcComplete, total: pmComplete, percentage: pmComplete ? Math.round((gcComplete / pmComplete) * 100) : 0 },
        { gate: 'Repair Verification', complete: repairComplete, total: gcComplete, percentage: gcComplete ? Math.round((repairComplete / gcComplete) * 100) : 0 },
        { gate: 'Homeowner Signoff', complete: homeownerComplete, total: repairComplete, percentage: repairComplete ? Math.round((homeownerComplete / repairComplete) * 100) : 0 },
        { gate: 'Closure', complete: closeComplete, total: homeownerComplete, percentage: homeownerComplete ? Math.round((closeComplete / homeownerComplete) * 100) : 0 },
      ],
      totalClaims: total,
      fullyCompleted: closeComplete,
    });
  } catch (err) { next(err); }
});

export const warrantyRouter = router;
