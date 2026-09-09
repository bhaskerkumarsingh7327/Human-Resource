import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { RoleName } from '../types';

/**
 * Usage: router.post('/employees', authenticate, authorize('ADMIN', 'HR'), controller)
 */
export function authorize(...allowedRoles: RoleName[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}
