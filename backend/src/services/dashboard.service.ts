import { DashboardModel } from '../models/dashboard.model';

export const DashboardService = {
  async overview(month: number, year: number) {
    const [totalEmployees, departmentStats, attendance, leaveStats, payroll] = await Promise.all([
      DashboardModel.totalEmployees(),
      DashboardModel.departmentStats(),
      DashboardModel.attendancePercentage(month, year),
      DashboardModel.leaveStats(year),
      DashboardModel.payrollOverview(month, year),
    ]);

    return {
      totalEmployees,
      departmentStats,
      attendancePercentage: attendance.present_percentage,
      leaveStats,
      payrollOverview: payroll,
      period: { month, year },
    };
  },
};