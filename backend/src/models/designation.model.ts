import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface DesignationRow extends RowDataPacket {
  designation_id: number;
  title: string;
  level: number;
}

export const DesignationModel = {
  async findAll(): Promise<DesignationRow[]> {
    const [rows] = await pool.query<DesignationRow[]>(
      `SELECT designation_id, title, level FROM designations ORDER BY level, title`
    );
    return rows;
  },

  async findById(id: number): Promise<DesignationRow | null> {
    const [rows] = await pool.query<DesignationRow[]>(
      `SELECT designation_id, title, level FROM designations WHERE designation_id = ?`,
      [id]
    );
    return rows[0] ?? null;
  },

  async findByTitle(title: string): Promise<DesignationRow | null> {
    const [rows] = await pool.query<DesignationRow[]>(
      `SELECT designation_id, title FROM designations WHERE title = ?`,
      [title]
    );
    return rows[0] ?? null;
  },

  async create(title: string, level = 1): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO designations (title, level) VALUES (?, ?)`,
      [title, level]
    );
    return result.insertId;
  },

  async update(id: number, fields: Partial<{ title: string; level: number }>): Promise<void> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    if (fields.title !== undefined) {
      setClauses.push('title = ?');
      values.push(fields.title);
    }
    if (fields.level !== undefined) {
      setClauses.push('level = ?');
      values.push(fields.level);
    }
    if (setClauses.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE designations SET ${setClauses.join(', ')} WHERE designation_id = ?`, values);
  },

  async delete(id: number): Promise<void> {
    await pool.query(`DELETE FROM designations WHERE designation_id = ?`, [id]);
  },
};