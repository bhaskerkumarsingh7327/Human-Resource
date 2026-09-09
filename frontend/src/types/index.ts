export type RoleName = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export interface User {
  userId: number;
  email: string;
  role: RoleName;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}