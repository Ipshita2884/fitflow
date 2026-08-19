import { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../lib/errors';
import { AuthPayload } from './auth.middleware';

/**
 * Route-level role gate. Use after requireAuth.
 * Example: router.post('/sessions', requireAuth, requireRole('TRAINER'), ...)
 */
export function requireRole(...roles: AuthPayload['role'][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return next(new ForbiddenError());
    }
    return next();
  };
}
