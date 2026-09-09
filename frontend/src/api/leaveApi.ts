import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '../types';

export interface LeaveType {
  leave_type_id: number;
  name: string;
  default_days_per_year: number;
  is_paid: number;
}

export interface LeaveRequest {
  leave_request_id: number;
  employee_id: number;
  employee_name: string;
  leave_type_id: number;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  created_at: string;
}

export interface LeaveBalance {
  leave_type_id: number;
  leave_type_name: string;
  allocated_days: number;
  used_days: number;
}

export interface ApplyLeavePayload {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason?: string;
}

export const leaveApi = {
  listTypes: async (): Promise<LeaveType[]> => {
    const { data } = await axiosInstance.get<ApiResponse<LeaveType[]>>('/leaves/types');
    return data.data;
  },

  apply: async (payload: ApplyLeavePayload): Promise<LeaveRequest> => {
    const { data } = await axiosInstance.post<ApiResponse<LeaveRequest>>('/leaves/apply', payload);
    return data.data;
  },

  myRequests: async (): Promise<LeaveRequest[]> => {
    const { data } = await axiosInstance.get<ApiResponse<LeaveRequest[]>>('/leaves/my');
    return data.data;
  },

  myBalance: async (): Promise<LeaveBalance[]> => {
    const { data } = await axiosInstance.get<ApiResponse<LeaveBalance[]>>('/leaves/balance');
    return data.data;
  },

  listAll: async (status?: string): Promise<{ requests: LeaveRequest[] }> => {
    const { data } = await axiosInstance.get<ApiResponse<{ requests: LeaveRequest[] }>>('/leaves', {
      params: { status },
    });
    return data.data;
  },

  approve: async (id: number): Promise<LeaveRequest> => {
    const { data } = await axiosInstance.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/approve`);
    return data.data;
  },

  reject: async (id: number): Promise<LeaveRequest> => {
    const { data } = await axiosInstance.put<ApiResponse<LeaveRequest>>(`/leaves/${id}/reject`);
    return data.data;
  },
};