import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface DepartmentRow extends RowDataPacket {
  department_id: number;
  department_name: string;
  description: string | null;
  head_employee_id: number | null;
  employee_count: number;
}

export const DepartmentModel = {
  async findAll(): Promise<DepartmentRow[]> {
    const [rows] = await pool.query<DepartmentRow[]>(
      `SELECT d.department_id, d.department_name, d.description, d.head_employee_id,
              COUNT(e.employee_id) AS employee_count
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.department_id
       GROUP BY d.department_id
       ORDER BY d.department_name`
    );
    return rows;
  },

  async findById(id: number): Promise<DepartmentRow | null> {
    const [rows] = await pool.query<DepartmentRow[]>(
      `SELECT department_id, department_name, description, head_employee_id
       FROM departments WHERE department_id = ?`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByName(name: string): Promise<DepartmentRow | null> {
    const [rows] = await pool.query<DepartmentRow[]>(
      `SELECT department_id, department_name FROM departments WHERE department_name = ?`,
      [name]
    );
    return rows[0] ?? null;
  },

  async create(name: string, description?: string): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO departments (department_name, description) VALUES (?, ?)`,
      [name, description ?? null]
    );
    return result.insertId;
  },

  async update(id: number, fields: Partial<{ departmentName: string; description: string; headEmployeeId: number }>): Promise<void> {
    const setClauses: string[] = [];
    const values: unknown[] = [];

    if (fields.departmentName !== undefined) {
      setClauses.push('department_name = ?');
      values.push(fields.departmentName);
    }
    if (fields.description !== undefined) {
      setClauses.push('description = ?');
      values.push(fields.description);
    }
    if (fields.headEmployeeId !== undefined) {
      setClauses.push('head_employee_id = ?');
      values.push(fields.headEmployeeId);
    }
    if (setClauses.length === 0) return;

    values.push(id);
    await pool.query(`UPDATE departments SET ${setClauses.join(', ')} WHERE department_id = ?`, values);
  },

  async delete(id: number): Promise<void> {
    await pool.query(`DELETE FROM departments WHERE department_id = ?`, [id]);
  },

  async assignEmployee(employeeId: number, departmentId: number): Promise<void> {
    await pool.query(`UPDATE employees SET department_id = ? WHERE employee_id = ?`, [departmentId, employeeId]);
  },
};