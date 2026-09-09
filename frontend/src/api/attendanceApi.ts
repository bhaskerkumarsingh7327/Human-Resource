import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '../types';

export interface AttendanceRecord {
  attendance_id: number;
  employee_id: number;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  working_hours: number | null;
  status: string;
}

export const attendanceApi = {
  checkIn: async (): Promise<AttendanceRecord> => {
    const { data } = await axiosInstance.post<ApiResponse<AttendanceRecord>>('/attendance/check-in');
    return data.data;
  },

  checkOut: async (): Promise<AttendanceRecord> => {
    const { data } = await axiosInstance.post<ApiResponse<AttendanceRecord>>('/attendance/check-out');
    return data.data;
  },

  myHistory: async (month?: number, year?: number): Promise<AttendanceRecord[]> => {
    const { data } = await axiosInstance.get<ApiResponse<AttendanceRecord[]>>('/attendance/my-history', {
      params: { month, year },
    });
    return data.data;
  },
};