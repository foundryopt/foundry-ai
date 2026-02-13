import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/comments?lineItemId=xxx
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lineItemId } = req.query;
    const where: any = {};
    if (lineItemId) where.lineItemId = lineItemId;

    const comments = await prisma.budgetComment.findMany({
      where,
      include: { author: { select: { name: true } } },
      orderBy: { timestamp: 'asc' },
    });

    res.json(comments.map((c) => ({
      id: c.id,
      lineItemId: c.lineItemId,
      author: c.author.name,
      timestamp: c.timestamp.toISOString(),
      text: c.text,
      source: c.source,
    })));
  } catch (err) { next(err); }
});

const CreateCommentSchema = z.object({
  lineItemId: z.string(),
  text: z.string().min(1),
  source: z.enum(['dashboard', 'slack']).default('dashboard'),
});

// POST /api/comments
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = CreateCommentSchema.parse(req.body);
    const user = await prisma.appUser.findFirst({ where: { name: req.user!.name } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const comment = await prisma.budgetComment.create({
      data: {
        lineItemId: body.lineItemId,
        authorId: user.id,
        text: body.text,
        source: body.source,
      },
      include: { author: { select: { name: true } } },
    });

    res.status(201).json({
      id: comment.id,
      lineItemId: comment.lineItemId,
      author: comment.author.name,
      timestamp: comment.timestamp.toISOString(),
      text: comment.text,
      source: comment.source,
    });
  } catch (err) { next(err); }
});

export const commentsRouter = router;
