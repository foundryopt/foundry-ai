import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { serializeQAQCData } from '../serializers/qaqc.serializer';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/qaqc/:projectId
router.get('/:projectId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [docs, checklists] = await Promise.all([
      prisma.qAQCDocument.findMany({ where: { projectId: req.params.projectId } }),
      prisma.qCChecklist.findMany({ where: { projectId: req.params.projectId } }),
    ]);
    res.json(serializeQAQCData(docs, checklists));
  } catch (err) { next(err); }
});

export const qaqcRouter = router;
