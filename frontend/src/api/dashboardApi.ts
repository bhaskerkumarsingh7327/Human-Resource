import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '../types';

export interface DashboardOverview {
  totalEmployees: number;
  departmentStats: { department_name: string; employee_count: number }[];
  attendancePercentage: number;
  leaveStats: { leave_type: string; total_requests: number; approved: number; pending: number; rejected: number }[];
  payrollOverview: { total_payslips: number; total_net_paid: number; total_deductions: number; total_allowances: number };
  period: { month: number; year: number };
}

export interface TeamMember {
  employee_id: number;
  first_name: string;
  last_name: string;
  employment_status: string;
}

export interface TeamPendingLeave {
  leave_request_id: number;
  employee_name: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
}

export interface TeamSummary {
  teamSize: number;
  team: TeamMember[];
  todayAttendance: { present: number; absent: number; onLeave: number };
  pendingLeaves: TeamPendingLeave[];
}

export const dashboardApi = {
  overview: async (month?: number, year?: number) => {
    const { data } = await axiosInstance.get<ApiResponse<DashboardOverview>>('/dashboard/overview', {
      params: { month, year },
    });
    return data.data;
  },

  teamSummary: async (): Promise<TeamSummary> => {
    const { data } = await axiosInstance.get<ApiResponse<TeamSummary>>('/dashboard/team-summary');
    return data.data;
  },
};