import { Response } from 'express';

export function sendSuccess<T>(res: Response, statusCode: number, message: string, data: T) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendError(res: Response, statusCode: number, message: string, errors?: unknown) {
  return res.status(statusCode).json({ success: false, message, errors });
}
