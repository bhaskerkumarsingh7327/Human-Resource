import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

export function globalErrorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Unexpected/programming error — never leak internals in production
  console.error('UNEXPECTED ERROR:', err);
  return res.status(500).json({
    success: false,
    message: env.nodeEnv === 'production' ? 'Internal server error' : String(err),
  });
}
