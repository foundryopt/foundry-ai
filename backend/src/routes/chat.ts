import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { handleChatQuery } from '../chatbot/handler';

const router = Router();

const ChatQuerySchema = z.object({
  query: z.string().min(1),
  projectId: z.string().optional(),
});

// POST /api/chat/query
router.post('/query', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = ChatQuerySchema.parse(req.body);
    const result = await handleChatQuery(body.query, body.projectId, req.user!);
    res.json(result);
  } catch (err) { next(err); }
});

export const chatRouter = router;
