import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface LeaveTypeRow extends RowDataPacket {
  leave_type_id: number;
  name: string;
  default_days_per_year: number;
  is_paid: number;
}

export interface LeaveRequestRow extends RowDataPacket {
  leave_request_id: number;
  employee_id: number;
  employee_name: string;
  leave_type_id: number;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: string;
  approved_by: number | null;
  approved_at: string | null;
}

export const LeaveTypeModel = {
  async findAll(): Promise<LeaveTypeRow[]> {
    const [rows] = await pool.query<LeaveTypeRow[]>(`SELECT * FROM leave_types ORDER BY name`);
    return rows;
  },
  async findById(id: number): Promise<LeaveTypeRow | null> {
    const [rows] = await pool.query<LeaveTypeRow[]>(`SELECT * FROM leave_types WHERE leave_type_id = ?`, [id]);
    return rows[0] ?? null;
  },
  async create(name: string, defaultDays: number, isPaid: boolean): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO leave_types (name, default_days_per_year, is_paid) VALUES (?, ?, ?)`,
      [name, defaultDays, isPaid]
    );
    return result.insertId;
  },
};

export const LeaveRequestModel = {
  async create(
    employeeId: number,
    leaveTypeId: number,
    startDate: string,
    endDate: string,
    totalDays: number,
    reason?: string
  ): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, total_days, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employeeId, leaveTypeId, startDate, endDate, totalDays, reason ?? null]
    );
    return result.insertId;
  },

  async findById(id: number): Promise<LeaveRequestRow | null> {
    const [rows] = await pool.query<LeaveRequestRow[]>(
      `SELECT lr.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, lt.name AS leave_type_name
       FROM leave_requests lr
       JOIN employees e ON e.employee_id = lr.employee_id
       JOIN leave_types lt ON lt.leave_type_id = lr.leave_type_id
       WHERE lr.leave_request_id = ?`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByEmployee(employeeId: number): Promise<LeaveRequestRow[]> {
    const [rows] = await pool.query<LeaveRequestRow[]>(
      `SELECT lr.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, lt.name AS leave_type_name
       FROM leave_requests lr
       JOIN employees e ON e.employee_id = lr.employee_id
       JOIN leave_types lt ON lt.leave_type_id = lr.leave_type_id
       WHERE lr.employee_id = ?
       ORDER BY lr.created_at DESC`,
      [employeeId]
    );
    return rows;
  },

  async findAll(filters: { status?: string; employeeId?: number; page: number; limit: number }): Promise<{ rows: LeaveRequestRow[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.status) {
      conditions.push('lr.status = ?');
      values.push(filters.status);
    }
    if (filters.employeeId) {
      conditions.push('lr.employee_id = ?');
      values.push(filters.employeeId);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (filters.page - 1) * filters.limit;

    const [rows] = await pool.query<LeaveRequestRow[]>(
      `SELECT lr.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, lt.name AS leave_type_name
       FROM leave_requests lr
       JOIN employees e ON e.employee_id = lr.employee_id
       JOIN leave_types lt ON lt.leave_type_id = lr.leave_type_id
       ${whereClause}
       ORDER BY lr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, filters.limit, offset]
    );

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM leave_requests lr ${whereClause}`,
      values
    );

    return { rows, total: countRows[0]?.total ?? 0 };
  },

  async updateStatus(id: number, status: 'APPROVED' | 'REJECTED' | 'CANCELLED', approverId: number): Promise<void> {
    await pool.query(
      `UPDATE leave_requests SET status = ?, approved_by = ?, approved_at = NOW() WHERE leave_request_id = ?`,
      [status, approverId, id]
    );
  },
};

export const LeaveBalanceModel = {
  async getOrCreate(employeeId: number, leaveTypeId: number, year: number, allocatedDays: number): Promise<RowDataPacket> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
      [employeeId, leaveTypeId, year]
    );
    if (rows[0]) return rows[0];

    await pool.query(
      `INSERT INTO leave_balances (employee_id, leave_type_id, year, allocated_days, used_days)
       VALUES (?, ?, ?, ?, 0)`,
      [employeeId, leaveTypeId, year, allocatedDays]
    );
    const [newRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
      [employeeId, leaveTypeId, year]
    );
    return newRows[0];
  },

  async findByEmployee(employeeId: number, year: number): Promise<RowDataPacket[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT lb.*, lt.name AS leave_type_name
       FROM leave_balances lb
       JOIN leave_types lt ON lt.leave_type_id = lb.leave_type_id
       WHERE lb.employee_id = ? AND lb.year = ?`,
      [employeeId, year]
    );
    return rows;
  },

  async incrementUsedDays(employeeId: number, leaveTypeId: number, year: number, days: number): Promise<void> {
    await pool.query(
      `UPDATE leave_balances SET used_days = used_days + ? WHERE employee_id = ? AND leave_type_id = ? AND year = ?`,
      [days, employeeId, leaveTypeId, year]
    );
  },
};