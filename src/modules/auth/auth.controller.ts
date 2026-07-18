import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../../config/env.js';
import { AppError } from '../../errors/app-error.js';
import { prisma } from '../../lib/prisma.js';
import { loginSchema, registerSchema } from './auth.schemas.js';

function createAccessToken(user: { id: string; email: string; role: string }): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as Exclude<SignOptions['expiresIn'], undefined>,
  };

  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    options,
  );
}

function serializeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}): object {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function register(request: Request, response: Response): Promise<void> {
  const input = registerSchema.parse(request.body);
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new AppError('Email is already registered.', 409);
  }

  const userCount = await prisma.user.count();
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: userCount === 0 ? 'ADMIN' : 'CUSTOMER',
    },
  });

  response.status(201).json({
    data: {
      user: serializeUser(user),
      accessToken: createAccessToken(user),
    },
  });
}

export async function login(request: Request, response: Response): Promise<void> {
  const input = loginSchema.parse(request.body);
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError('Invalid email or password.', 401);
  }

  response.status(200).json({
    data: {
      user: serializeUser(user),
      accessToken: createAccessToken(user),
    },
  });
}
