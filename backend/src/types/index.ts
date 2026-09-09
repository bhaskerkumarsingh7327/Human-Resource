export type RoleName = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export interface JwtPayload {
  userId: number;
  email: string;
  role: RoleName;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: unknown;
}

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: import('./index').JwtPayload;
    }
  }
}
