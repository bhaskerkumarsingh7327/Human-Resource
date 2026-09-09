import { pool } from '../config/db';
import { RowDataPacket } from 'mysql2';

export const DashboardModel = {
  async totalEmployees(): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM employees WHERE employment_status = 'ACTIVE'`
    );
    return rows[0]?.total ?? 0;
  },

  async departmentStats(): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT d.department_name, COUNT(e.employee_id) AS employee_count
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.department_id AND e.employment_status = 'ACTIVE'
       GROUP BY d.department_id
       ORDER BY employee_count DESC`
    );
    return rows;
  },

  async attendancePercentage(month: number, year: number): Promise<{ present_percentage: number }> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         ROUND(
           SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100, 2
         ) AS present_percentage
       FROM attendance a
       WHERE MONTH(a.attendance_date) = ? AND YEAR(a.attendance_date) = ?`,
      [month, year]
    );
    return { present_percentage: rows[0]?.present_percentage ?? 0 };
  },

  async leaveStats(year: number): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT lt.name AS leave_type, COUNT(lr.leave_request_id) AS total_requests,
              SUM(CASE WHEN lr.status = 'APPROVED' THEN 1 ELSE 0 END) AS approved,
              SUM(CASE WHEN lr.status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
              SUM(CASE WHEN lr.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected
       FROM leave_requests lr
       JOIN leave_types lt ON lt.leave_type_id = lr.leave_type_id
       WHERE YEAR(lr.start_date) = ?
       GROUP BY lt.leave_type_id`,
      [year]
    );
    return rows;
  },

  async payrollOverview(month: number, year: number): Promise<RowDataPacket> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         COUNT(*) AS total_payslips,
         COALESCE(SUM(net_salary), 0) AS total_net_paid,
         COALESCE(SUM(total_deductions), 0) AS total_deductions,
         COALESCE(SUM(total_allowances), 0) AS total_allowances
       FROM payroll
       WHERE pay_month = ? AND pay_year = ?`,
      [month, year]
    );
    return rows[0];
  },
};