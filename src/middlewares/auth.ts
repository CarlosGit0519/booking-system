import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';

import { env } from '../config/env.js';
import { AppError } from '../errors/app-error.js';

type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER';

function isUserRole(value: unknown): value is UserRole {
  return value === 'ADMIN' || value === 'STAFF' || value === 'CUSTOMER';
}

export function requireAuth(request: Request, _response: Response, next: NextFunction): void {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError('Authentication token is required.', 401));
    return;
  }

  try {
    const token = authorization.slice('Bearer '.length);
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (typeof payload === 'string') {
      throw new AppError('Invalid authentication token.', 401);
    }

    const { sub, email, role } = payload as JwtPayload & {
      email?: unknown;
      role?: unknown;
    };

    if (typeof sub !== 'string' || typeof email !== 'string' || !isUserRole(role)) {
      throw new AppError('Invalid authentication token.', 401);
    }

    request.auth = { userId: sub, email, role };
    next();
  } catch (error: unknown) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError('Invalid or expired authentication token.', 401));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.auth || !roles.includes(request.auth.role)) {
      next(new AppError('You do not have permission to perform this action.', 403));
      return;
    }

    next();
  };
}
