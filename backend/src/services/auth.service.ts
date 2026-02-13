import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { AppError } from '../middleware/error-handler';
import type { AuthPayload, LoginResponse, Role } from '../shared/types';

const prisma = new PrismaClient();

export async function login(name: string, role: Role): Promise<LoginResponse> {
  // Find user by name
  const user = await prisma.appUser.findUnique({ where: { name } });
  if (!user) {
    throw new AppError(401, 'User not found');
  }

  // For the prototype, we do a simple role-match login (no password required)
  // In production, you'd verify password: await bcrypt.compare(password, user.passwordHash)

  const payload: AuthPayload = {
    userId: user.id,
    name: user.name,
    role: user.role as Role,
  };

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });

  return {
    token,
    user: {
      name: user.name,
      role: user.role as Role,
    },
  };
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const user = await prisma.appUser.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid credentials');
  }

  const payload: AuthPayload = {
    userId: user.id,
    name: user.name,
    role: user.role as Role,
  };

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });

  return {
    token,
    user: {
      name: user.name,
      role: user.role as Role,
    },
  };
}
