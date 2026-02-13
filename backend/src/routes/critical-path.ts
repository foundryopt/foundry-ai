import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { serializeCriticalPath } from '../serializers/critical-path.serializer';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/critical-path/:projectId
router.get('/:projectId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [milestones, activities] = await Promise.all([
      prisma.criticalPathMilestone.findMany({ where: { projectId: req.params.projectId } }),
      prisma.milestoneActivity.findMany({ where: { projectId: req.params.projectId } }),
    ]);
    res.json(serializeCriticalPath(milestones, activities));
  } catch (err) { next(err); }
});

export const criticalPathRouter = router;
