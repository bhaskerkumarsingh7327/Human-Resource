import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { EmployeeQuery } from '../validators/employee.validator';

export interface EmployeeRow extends RowDataPacket {
  employee_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  profile_photo_url: string | null;
  department_id: number | null;
  department_name: string | null;
  designation_id: number | null;
  designation_title: string | null;
  manager_id: number | null;
  date_of_joining: string;
  employment_status: string;
  email: string;
}

interface CreateEmployeeProfileInput {
  userId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  departmentId?: number;
  designationId?: number;
  dateOfJoining: string;
}

const BASE_SELECT = `
  SELECT
    e.employee_id, e.employee_code, e.first_name, e.last_name, e.phone,
    e.date_of_birth, e.gender, e.address, e.profile_photo_url,
    e.department_id, d.department_name,
    e.designation_id, des.title AS designation_title,
    e.manager_id, e.date_of_joining, e.employment_status,
    u.email
  FROM employees e
  JOIN users u ON u.user_id = e.user_id
  LEFT JOIN departments d ON d.department_id = e.department_id
  LEFT JOIN designations des ON des.designation_id = e.designation_id
`;

export const EmployeeModel = {
  // --- used by AuthService.register ---
  async create(input: CreateEmployeeProfileInput): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO employees
        (user_id, employee_code, first_name, last_name, department_id, designation_id, date_of_joining)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        input.userId,
        input.employeeCode,
        input.firstName,
        input.lastName,
        input.departmentId ?? null,
        input.designationId ?? null,
        input.dateOfJoining,
      ]
    );
    return result.insertId;
  },

  async generateNextEmployeeCode(): Promise<string> {
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM employees`);
    const nextNumber = (rows[0]?.total ?? 0) + 1;
    return `EMP-${String(nextNumber).padStart(4, '0')}`;
  },

  // --- listing, search/filter, CRUD ---
  async findAll(filters: EmployeeQuery): Promise<{ rows: EmployeeRow[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.search) {
      conditions.push('(e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_code LIKE ? OR u.email LIKE ?)');
      const like = `%${filters.search}%`;
      values.push(like, like, like, like);
    }
    if (filters.departmentId) {
      conditions.push('e.department_id = ?');
      values.push(filters.departmentId);
    }
    if (filters.designationId) {
      conditions.push('e.designation_id = ?');
      values.push(filters.designationId);
    }
    if (filters.managerId) {
      conditions.push('e.manager_id = ?');
      values.push(filters.managerId);
    }
    if (filters.status) {
      conditions.push('e.employment_status = ?');
      values.push(filters.status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (filters.page - 1) * filters.limit;

    const [rows] = await pool.query<EmployeeRow[]>(
      `${BASE_SELECT} ${whereClause} ORDER BY e.employee_id DESC LIMIT ? OFFSET ?`,
      [...values, filters.limit, offset]
    );

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM employees e JOIN users u ON u.user_id = e.user_id ${whereClause}`,
      values
    );

    return { rows, total: countRows[0]?.total ?? 0 };
  },

  async findById(id: number): Promise<EmployeeRow | null> {
    const [rows] = await pool.query<EmployeeRow[]>(`${BASE_SELECT} WHERE e.employee_id = ?`, [id]);
    return rows[0] ?? null;
  },

  async findByUserId(userId: number): Promise<{ employee_id: number } | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT employee_id FROM employees WHERE user_id = ?`,
      [userId]
    );
    return (rows[0] as any) ?? null;
  },

  async update(id: number, fields: Record<string, unknown>): Promise<void> {
    const columnMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      phone: 'phone',
      dateOfBirth: 'date_of_birth',
      gender: 'gender',
      address: 'address',
      departmentId: 'department_id',
      designationId: 'designation_id',
      managerId: 'manager_id',
      employmentStatus: 'employment_status',
    };

    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const [key, column] of Object.entries(columnMap)) {
      if (fields[key] !== undefined) {
        setClauses.push(`${column} = ?`);
        values.push(fields[key]);
      }
    }
    if (setClauses.length === 0) return;

    values.push(id);
    await pool.query(`UPDATE employees SET ${setClauses.join(', ')} WHERE employee_id = ?`, values);
  },

  async updatePhoto(id: number, photoUrl: string): Promise<void> {
    await pool.query(`UPDATE employees SET profile_photo_url = ? WHERE employee_id = ?`, [photoUrl, id]);
  },

  async delete(id: number): Promise<void> {
    const [empRows] = await pool.query<RowDataPacket[]>(
      `SELECT user_id FROM employees WHERE employee_id = ?`,
      [id]
    );
    const userId = empRows[0]?.user_id;
    if (userId) {
      await pool.query(`DELETE FROM users WHERE user_id = ?`, [userId]);
    }
  },
};