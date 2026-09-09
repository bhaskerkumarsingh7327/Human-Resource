import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface SalaryRow extends RowDataPacket {
  salary_id: number;
  employee_id: number;
  basic_salary: number;
  hra: number;
  other_allowances: number;
  effective_from: string;
}

export interface PayrollRow extends RowDataPacket {
  payroll_id: number;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  pay_month: number;
  pay_year: number;
  basic_salary: number;
  total_allowances: number;
  total_deductions: number;
  net_salary: number;
  status: string;
  generated_at: string;
}

export const SalaryModel = {
  async findByEmployee(employeeId: number): Promise<SalaryRow | null> {
    const [rows] = await pool.query<SalaryRow[]>(
      `SELECT * FROM salary WHERE employee_id = ?`,
      [employeeId]
    );
    return rows[0] ?? null;
  },

  async upsert(employeeId: number, basicSalary: number, hra: number, otherAllowances: number, effectiveFrom: string): Promise<void> {
    const existing = await this.findByEmployee(employeeId);
    if (existing) {
      await pool.query(
        `UPDATE salary SET basic_salary = ?, hra = ?, other_allowances = ?, effective_from = ? WHERE employee_id = ?`,
        [basicSalary, hra, otherAllowances, effectiveFrom, employeeId]
      );
    } else {
      await pool.query(
        `INSERT INTO salary (employee_id, basic_salary, hra, other_allowances, effective_from) VALUES (?, ?, ?, ?, ?)`,
        [employeeId, basicSalary, hra, otherAllowances, effectiveFrom]
      );
    }
  },

  async findAllActiveWithSalary(): Promise<SalaryRow[]> {
    const [rows] = await pool.query<SalaryRow[]>(
      `SELECT s.* FROM salary s
       JOIN employees e ON e.employee_id = s.employee_id
       WHERE e.employment_status = 'ACTIVE'`
    );
    return rows;
  },
};

const BASE_SELECT = `
  SELECT p.*, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, e.employee_code
  FROM payroll p
  JOIN employees e ON e.employee_id = p.employee_id
`;

export const PayrollModel = {
  async exists(employeeId: number, month: number, year: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT payroll_id FROM payroll WHERE employee_id = ? AND pay_month = ? AND pay_year = ?`,
      [employeeId, month, year]
    );
    return rows.length > 0;
  },

  async create(
    employeeId: number,
    month: number,
    year: number,
    basicSalary: number,
    totalAllowances: number,
    totalDeductions: number,
    netSalary: number
  ): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO payroll (employee_id, pay_month, pay_year, basic_salary, total_allowances, total_deductions, net_salary, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'GENERATED')`,
      [employeeId, month, year, basicSalary, totalAllowances, totalDeductions, netSalary]
    );
    return result.insertId;
  },

  async findById(id: number): Promise<PayrollRow | null> {
    const [rows] = await pool.query<PayrollRow[]>(`${BASE_SELECT} WHERE p.payroll_id = ?`, [id]);
    return rows[0] ?? null;
  },

  async findByEmployee(employeeId: number): Promise<PayrollRow[]> {
    const [rows] = await pool.query<PayrollRow[]>(
      `${BASE_SELECT} WHERE p.employee_id = ? ORDER BY p.pay_year DESC, p.pay_month DESC`,
      [employeeId]
    );
    return rows;
  },

  async findAll(filters: { month?: number; year?: number; employeeId?: number; page: number; limit: number }): Promise<{ rows: PayrollRow[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filters.month) {
      conditions.push('p.pay_month = ?');
      values.push(filters.month);
    }
    if (filters.year) {
      conditions.push('p.pay_year = ?');
      values.push(filters.year);
    }
    if (filters.employeeId) {
      conditions.push('p.employee_id = ?');
      values.push(filters.employeeId);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (filters.page - 1) * filters.limit;

    const [rows] = await pool.query<PayrollRow[]>(
      `${BASE_SELECT} ${whereClause} ORDER BY p.pay_year DESC, p.pay_month DESC LIMIT ? OFFSET ?`,
      [...values, filters.limit, offset]
    );

    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM payroll p ${whereClause}`,
      values
    );

    return { rows, total: countRows[0]?.total ?? 0 };
  },

  async markPaid(id: number): Promise<void> {
    await pool.query(`UPDATE payroll SET status = 'PAID' WHERE payroll_id = ?`, [id]);
  },
};