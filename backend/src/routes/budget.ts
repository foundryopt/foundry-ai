import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { serializeBudgetSummary } from '../serializers/budget.serializer';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/budget/:projectId
router.get('/:projectId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.budgetCategory.findMany({
      where: { projectId: req.params.projectId },
      include: { lineItems: true, project: { select: { name: true } } },
    });
    res.json(serializeBudgetSummary(categories as any));
  } catch (err) { next(err); }
});

export const budgetRouter = router;
