import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { login, loginWithPassword } from '../services/auth.service';

const router = Router();

const LoginByNameSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['PM', 'Super', 'Principal', "Owner's Rep", 'Procurement', 'Ops', 'Designer']),
});

const LoginByEmailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login — simple name+role login (matches dashboard behavior)
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = LoginByNameSchema.parse(req.body);
    const result = await login(body.name, body.role);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login-email — email+password login
router.post('/login-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = LoginByEmailSchema.parse(req.body);
    const result = await loginWithPassword(body.email, body.password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export const authRouter = router;
