import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface PerformanceReviewRow extends RowDataPacket {
  review_id: number;
  employee_id: number;
  employee_name: string;
  reviewer_id: number;
  reviewer_name: string;
  review_period: string;
  rating: number;
  feedback: string | null;
  goals_next_period: string | null;
  created_at: string;
}

const BASE_SELECT = `
  SELECT r.*,
    CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
    CONCAT(m.first_name, ' ', m.last_name) AS reviewer_name
  FROM performance_reviews r
  JOIN employees e ON e.employee_id = r.employee_id
  JOIN employees m ON m.employee_id = r.reviewer_id
`;

export const PerformanceModel = {
  async create(
    employeeId: number,
    reviewerId: number,
    reviewPeriod: string,
    rating: number,
    feedback?: string,
    goalsNextPeriod?: string
  ): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO performance_reviews (employee_id, reviewer_id, review_period, rating, feedback, goals_next_period)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employeeId, reviewerId, reviewPeriod, rating, feedback ?? null, goalsNextPeriod ?? null]
    );
    return result.insertId;
  },

  async findById(id: number): Promise<PerformanceReviewRow | null> {
    const [rows] = await pool.query<PerformanceReviewRow[]>(`${BASE_SELECT} WHERE r.review_id = ?`, [id]);
    return rows[0] ?? null;
  },

  async findByEmployee(employeeId: number): Promise<PerformanceReviewRow[]> {
    const [rows] = await pool.query<PerformanceReviewRow[]>(
      `${BASE_SELECT} WHERE r.employee_id = ? ORDER BY r.created_at DESC`,
      [employeeId]
    );
    return rows;
  },

  async update(id: number, fields: Partial<{ rating: number; feedback: string; goalsNextPeriod: string }>): Promise<void> {
    const columnMap: Record<string, string> = {
      rating: 'rating',
      feedback: 'feedback',
      goalsNextPeriod: 'goals_next_period',
    };
    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const [key, column] of Object.entries(columnMap)) {
      if ((fields as any)[key] !== undefined) {
        setClauses.push(`${column} = ?`);
        values.push((fields as any)[key]);
      }
    }
    if (setClauses.length === 0) return;

    values.push(id);
    await pool.query(`UPDATE performance_reviews SET ${setClauses.join(', ')} WHERE review_id = ?`, values);
  },
};