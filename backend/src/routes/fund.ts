import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { serializeFundDraw } from '../serializers/business.serializer';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role-guard';
import type { FundSummary } from '../shared/types';

const router = Router();

// GET /api/fund/:projectId — restricted to Principal, Owner's Rep
router.get(
  '/:projectId',
  authenticate,
  requireRole('Principal', "Owner's Rep"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const draws = await prisma.fundDraw.findMany({
        where: { projectId: req.params.projectId },
        orderBy: { drawNumber: 'asc' },
      });

      const totalDrawn = draws.filter((d) => d.status === 'approved').reduce((s, d) => s + d.amount, 0);
      const allAmount = draws.reduce((s, d) => s + d.amount, 0);
      const totalCommitment = allAmount > 0 ? Math.round(allAmount * 1.35) : 0;

      const summary: FundSummary = {
        totalCommitment,
        totalDrawn,
        totalRemaining: totalCommitment - totalDrawn,
        draws: draws.map(serializeFundDraw),
      };

      res.json(summary);
    } catch (err) { next(err); }
  },
);

export const fundRouter = router;
