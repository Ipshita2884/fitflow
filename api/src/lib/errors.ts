import { NextFunction, Request, Response } from 'express';

export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public details?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have access to this resource') {
    super(403, message);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, message);
  }
}

export class ValidationError extends ApiError {
  constructor(details: unknown) {
    super(422, 'Validation failed', details);
  }
}

/**
 * Wraps an async Express handler so thrown/rejected errors are forwarded to
 * error.middleware.ts instead of crashing the process or needing a try/catch
 * in every controller.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
