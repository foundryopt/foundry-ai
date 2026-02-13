import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { serializeTimesheetSummary } from '../serializers/timesheet.serializer';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/timesheet/:projectId
router.get('/:projectId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const costCodes = await prisma.timesheetCostCode.findMany({
      where: { projectId: req.params.projectId },
      include: { roleBreakdown: true },
    });
    res.json(serializeTimesheetSummary(costCodes as any));
  } catch (err) { next(err); }
});

export const timesheetRouter = router;
