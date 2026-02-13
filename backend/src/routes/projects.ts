import { Router, Request, Response, NextFunction } from 'express';
import { getProjectData, getProjects } from '../services/project.service';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/projects — list all projects
router.get('/', authenticate, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await getProjects();
    res.json(projects);
  } catch (err) { next(err); }
});

// GET /api/projects/:id/data — full ProjectData composite (critical endpoint)
router.get('/:id/data', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getProjectData(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
});

export const projectsRouter = router;
