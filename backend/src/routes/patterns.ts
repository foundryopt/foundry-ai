import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/patterns/:projectId/breaches
router.get('/:projectId/breaches', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const breaches = await prisma.repeatBreach.findMany({
      where: { projectId: req.params.projectId },
    });
    res.json(breaches.map((b) => ({
      projectId: b.projectId,
      category: b.category,
      owner: b.owner,
      count: b.count,
      avgDaysOverdue: b.avgDaysOverdue,
      pattern: b.pattern,
    })));
  } catch (err) { next(err); }
});

// GET /api/patterns/:projectId/loads
router.get('/:projectId/loads', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const loads = await prisma.ownerLoad.findMany({
      where: { projectId: req.params.projectId },
    });
    res.json(loads.map((l) => ({
      projectId: l.projectId,
      owner: l.owner,
      role: l.role,
      total: l.total,
      overdue: l.overdue,
      dueToday: l.dueToday,
      newItems: l.newItems,
      watching: l.watching,
    })));
  } catch (err) { next(err); }
});

// GET /api/patterns/:projectId/invoices
router.get('/:projectId/invoices', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const patterns = await prisma.invoicePattern.findMany({
      where: { projectId: req.params.projectId },
    });
    res.json(patterns.map((p) => ({
      projectId: p.projectId,
      vendor: p.vendor,
      invoiceCount: p.invoiceCount,
      issueCount: p.issueCount,
      commonIssue: p.commonIssue,
      avgResolutionDays: p.avgResolutionDays,
    })));
  } catch (err) { next(err); }
});

export const patternsRouter = router;
