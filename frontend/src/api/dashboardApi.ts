import { axiosInstance } from './axiosInstance';
import  type { ApiResponse } from '../types';

export interface DashboardOverview {
  totalEmployees: number;
  departmentStats: { department_name: string; employee_count: number }[];
  attendancePercentage: number;
  leaveStats: { leave_type: string; total_requests: number; approved: number; pending: number; rejected: number }[];
  payrollOverview: { total_payslips: number; total_net_paid: number; total_deductions: number; total_allowances: number };
  period: { month: number; year: number };
}

export const dashboardApi = {
  overview: async (month?: number, year?: number) => {
    const { data } = await axiosInstance.get<ApiResponse<DashboardOverview>>('/dashboard/overview', {
      params: { month, year },
    });
    return data.data;
  },
};