import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { serializeFinish } from '../serializers/design.serializer';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/design/:projectId/finishes
router.get('/:projectId/finishes', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const finishes = await prisma.finishSelection.findMany({
      where: { projectId: req.params.projectId },
    });
    res.json(finishes.map(serializeFinish));
  } catch (err) { next(err); }
});

export const designRouter = router;
