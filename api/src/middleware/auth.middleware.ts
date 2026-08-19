import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../lib/errors';

export interface AuthPayload {
  userId: string;
  role: 'TRAINER' | 'CLIENT' | 'ADMIN';
  // present only for CLIENT role — the trainer they belong to. Used by RBAC
  // checks so we never trust a client-supplied trainerId from the request body.
  trainerId?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Missing or malformed Authorization header'));
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as AuthPayload;
    req.auth = payload;
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
}
