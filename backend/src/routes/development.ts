import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { serializeDevMilestone } from '../serializers/business.serializer';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role-guard';

const router = Router();

// GET /api/development/:projectId — restricted to Principal, Owner's Rep
router.get(
  '/:projectId',
  authenticate,
  requireRole('Principal', "Owner's Rep"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const milestones = await prisma.devMilestone.findMany({
        where: { projectId: req.params.projectId },
      });
      res.json(milestones.map(serializeDevMilestone));
    } catch (err) { next(err); }
  },
);

export const developmentRouter = router;
