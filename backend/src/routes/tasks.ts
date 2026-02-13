import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma';
import { serializeTasks, serializeTask } from '../serializers/task.serializer';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/tasks — list tasks with filters
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { project, category, owner, urgency } = req.query;
    const where: any = {};
    if (project && project !== 'all') where.projectId = project;
    if (category) where.category = category;
    if (owner) where.owner = owner;
    if (urgency) where.urgency = urgency;

    const tasks = await prisma.task.findMany({ where });
    res.json(serializeTasks(tasks));
  } catch (err) { next(err); }
});

// GET /api/tasks/:id
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) { res.status(404).json({ error: 'Task not found' }); return; }
    res.json(serializeTask(task));
  } catch (err) { next(err); }
});

export const tasksRouter = router;
