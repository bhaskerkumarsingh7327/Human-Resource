import { DashboardModel } from '../models/dashboard.model';
import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

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

  /**
   * Team summary for a manager: their direct reports' headcount,
   * today's attendance breakdown, and pending leave requests for the team.
   */
  async teamSummary(managerEmployeeId: number) {
    const [teamRows] = await pool.query<RowDataPacket[]>(
      `SELECT employee_id, first_name, last_name, employment_status
       FROM employees WHERE manager_id = ?`,
      [managerEmployeeId]
    );

    const teamIds = teamRows.map((r) => r.employee_id);
    if (teamIds.length === 0) {
      return {
        teamSize: 0,
        team: [],
        todayAttendance: { present: 0, absent: 0, onLeave: 0 },
        pendingLeaves: [],
      };
    }

    const placeholders = teamIds.map(() => '?').join(',');

    const [attendanceRows] = await pool.query<RowDataPacket[]>(
      `SELECT status, COUNT(*) AS count FROM attendance
       WHERE employee_id IN (${placeholders}) AND attendance_date = CURDATE()
       GROUP BY status`,
      teamIds
    );

    const todayAttendance = { present: 0, absent: 0, onLeave: 0 };
    for (const row of attendanceRows) {
      if (row.status === 'PRESENT') todayAttendance.present = row.count;
      if (row.status === 'ABSENT') todayAttendance.absent = row.count;
      if (row.status === 'ON_LEAVE') todayAttendance.onLeave = row.count;
    }

    const [pendingLeaves] = await pool.query<RowDataPacket[]>(
      `SELECT lr.leave_request_id, lr.start_date, lr.end_date, lr.total_days,
              CONCAT(e.first_name, ' ', e.last_name) AS employee_name, lt.name AS leave_type_name
       FROM leave_requests lr
       JOIN employees e ON e.employee_id = lr.employee_id
       JOIN leave_types lt ON lt.leave_type_id = lr.leave_type_id
       WHERE lr.employee_id IN (${placeholders}) AND lr.status = 'PENDING'
       ORDER BY lr.created_at DESC`,
      teamIds
    );

    return {
      teamSize: teamIds.length,
      team: teamRows,
      todayAttendance,
      pendingLeaves,
    };
  },
};