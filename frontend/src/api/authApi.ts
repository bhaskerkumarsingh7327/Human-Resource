import { axiosInstance } from './axiosInstance';
import type { ApiResponse, AuthResponse } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return data.data;
  },

  me: async () => {
    const { data } = await axiosInstance.get<ApiResponse<any>>('/auth/me');
    return data.data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<string> => {
    const { data } = await axiosInstance.post<ApiResponse<null>>('/auth/forgot-password', payload);
    return data.message;
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<string> => {
    const { data } = await axiosInstance.post<ApiResponse<null>>('/auth/reset-password', payload);
    return data.message;
  },
};