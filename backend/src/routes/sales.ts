import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { serializeLeasingUnit, serializeShowroomEvent, serializePOSItem, serializeMembership } from '../serializers/business.serializer';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role-guard';

const router = Router();

// GET /api/sales/:projectId/leasing — restricted to Principal, Owner's Rep, Ops
router.get(
  '/:projectId/leasing',
  authenticate,
  requireRole('Principal', "Owner's Rep", 'Ops'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const units = await prisma.leasingUnit.findMany({ where: { projectId: req.params.projectId } });
      res.json(units.map(serializeLeasingUnit));
    } catch (err) { next(err); }
  },
);

// GET /api/sales/:projectId/events
router.get(
  '/:projectId/events',
  authenticate,
  requireRole('Principal', "Owner's Rep", 'Ops'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const events = await prisma.showroomEvent.findMany({
        where: { projectId: req.params.projectId },
        orderBy: { date: 'asc' },
      });
      res.json(events.map(serializeShowroomEvent));
    } catch (err) { next(err); }
  },
);

// GET /api/sales/:projectId/pos
router.get(
  '/:projectId/pos',
  authenticate,
  requireRole('Principal', "Owner's Rep", 'Ops'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await prisma.pOSItem.findMany({ where: { projectId: req.params.projectId } });
      res.json(items.map(serializePOSItem));
    } catch (err) { next(err); }
  },
);

// GET /api/sales/:projectId/memberships
router.get(
  '/:projectId/memberships',
  authenticate,
  requireRole('Principal', "Owner's Rep", 'Ops'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const members = await prisma.membership.findMany({ where: { projectId: req.params.projectId } });
      res.json(members.map(serializeMembership));
    } catch (err) { next(err); }
  },
);

export const salesRouter = router;
