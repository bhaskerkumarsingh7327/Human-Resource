import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '../types';

export interface PerformanceReview {
  review_id: number;
  employee_id: number;
  employee_name: string;
  reviewer_id: number;
  reviewer_name: string;
  review_period: string;
  rating: number;
  feedback: string | null;
  goals_next_period: string | null;
  created_at: string;
}

export interface CreateReviewPayload {
  employeeId: number;
  reviewPeriod: string;
  rating: number;
  feedback?: string;
  goalsNextPeriod?: string;
}

export const performanceApi = {
  myHistory: async (): Promise<PerformanceReview[]> => {
    const { data } = await axiosInstance.get<ApiResponse<PerformanceReview[]>>('/performance/my');
    return data.data;
  },

  employeeHistory: async (employeeId: number): Promise<PerformanceReview[]> => {
    const { data } = await axiosInstance.get<ApiResponse<PerformanceReview[]>>(`/performance/employee/${employeeId}`);
    return data.data;
  },

  create: async (payload: CreateReviewPayload): Promise<PerformanceReview> => {
    const { data } = await axiosInstance.post<ApiResponse<PerformanceReview>>('/performance', payload);
    return data.data;
  },
};