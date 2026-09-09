import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface AttendanceRow extends RowDataPacket {
  attendance_id: number;
  employee_id: number;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  working_hours: number | null;
  status: string;
}

export const AttendanceModel = {
  async findToday(employeeId: number): Promise<AttendanceRow | null> {
    const [rows] = await pool.query<AttendanceRow[]>(
      `SELECT * FROM attendance WHERE employee_id = ? AND attendance_date = CURDATE()`,
      [employeeId]
    );
    return rows[0] ?? null;
  },

  async checkIn(employeeId: number): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO attendance (employee_id, attendance_date, check_in_time, status)
       VALUES (?, CURDATE(), NOW(), 'PRESENT')`,
      [employeeId]
    );
    return result.insertId;
  },

  async checkOut(employeeId: number): Promise<void> {
    await pool.query(
      `UPDATE attendance
       SET check_out_time = NOW(),
           working_hours = ROUND(TIMESTAMPDIFF(MINUTE, check_in_time, NOW()) / 60, 2)
       WHERE employee_id = ? AND attendance_date = CURDATE()`,
      [employeeId]
    );
  },

  async findHistory(employeeId: number, month?: number, year?: number): Promise<AttendanceRow[]> {
    const conditions = ['employee_id = ?'];
    const values: unknown[] = [employeeId];

    if (month) {
      conditions.push('MONTH(attendance_date) = ?');
      values.push(month);
    }
    if (year) {
      conditions.push('YEAR(attendance_date) = ?');
      values.push(year);
    }

    const [rows] = await pool.query<AttendanceRow[]>(
      `SELECT * FROM attendance WHERE ${conditions.join(' AND ')} ORDER BY attendance_date DESC`,
      values
    );
    return rows;
  },

  async findMonthlyReport(month: number, year: number, departmentId?: number): Promise<RowDataPacket[]> {
    const whereClause = departmentId ? 'WHERE e.department_id = ?' : '';
    const values: unknown[] = [month, year];
    if (departmentId) values.push(departmentId);

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         e.employee_id, e.employee_code, e.first_name, e.last_name,
         COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) AS present_days,
         COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) AS absent_days,
         COUNT(CASE WHEN a.status = 'HALF_DAY' THEN 1 END) AS half_days,
         COUNT(CASE WHEN a.status = 'ON_LEAVE' THEN 1 END) AS leave_days,
         ROUND(SUM(a.working_hours), 2) AS total_working_hours
       FROM employees e
       LEFT JOIN attendance a
         ON a.employee_id = e.employee_id
         AND MONTH(a.attendance_date) = ? AND YEAR(a.attendance_date) = ?
       ${whereClause}
       GROUP BY e.employee_id
       ORDER BY e.first_name`,
      values
    );
    return rows;
  },
};