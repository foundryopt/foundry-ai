import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { serializeScheduleSummary } from '../serializers/schedule.serializer';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/schedule/:projectId
router.get('/:projectId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const phases = await prisma.schedulePhase.findMany({
      where: { projectId: req.params.projectId },
    });
    res.json(serializeScheduleSummary(phases));
  } catch (err) { next(err); }
});

export const scheduleRouter = router;
