import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { serializeWarranty } from '../serializers/warranty.serializer';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/warranty/:projectId
router.get('/:projectId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.warrantyItem.findMany({
      where: { projectId: req.params.projectId },
    });
    res.json(items.map(serializeWarranty));
  } catch (err) { next(err); }
});

export const warrantyRouter = router;
