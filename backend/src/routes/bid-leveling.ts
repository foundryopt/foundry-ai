import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/bid-leveling/:projectId/bids
router.get('/:projectId/bids', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bids = await prisma.vendorBidScope.findMany({
      where: { projectId: req.params.projectId },
    });
    res.json(bids.map((b) => ({
      scopeItem: b.scopeItem,
      costCode: b.costCode,
      vendors: b.vendors,
      delta: b.delta,
      notes: b.notes,
    })));
  } catch (err) { next(err); }
});

// GET /api/bid-leveling/:projectId/milestones
router.get('/:projectId/milestones', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const milestones = await prisma.bidMilestone.findMany({
      where: { projectId: req.params.projectId },
    });
    res.json(milestones.map((m) => ({
      id: m.id,
      bidPackage: m.bidPackage,
      costCode: m.costCode,
      milestones: m.milestones,
    })));
  } catch (err) { next(err); }
});

export const bidLevelingRouter = router;
