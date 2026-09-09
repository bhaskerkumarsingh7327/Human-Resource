import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface UserRow extends RowDataPacket {
  user_id: number;
  email: string;
  password_hash: string;
  role_id: number;
  role_name: string;
  is_active: number;
}

export const UserModel = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT u.user_id, u.email, u.password_hash, u.role_id, r.role_name, u.is_active
       FROM users u
       JOIN roles r ON r.role_id = u.role_id
       WHERE u.email = ?`,
      [email]
    );
    return rows[0] ?? null;
  },

  async findById(userId: number): Promise<UserRow | null> {
    const [rows] = await pool.query<UserRow[]>(
      `SELECT u.user_id, u.email, u.password_hash, u.role_id, r.role_name, u.is_active
       FROM users u
       JOIN roles r ON r.role_id = u.role_id
       WHERE u.user_id = ?`,
      [userId]
    );
    return rows[0] ?? null;
  },

  async getRoleIdByName(roleName: string): Promise<number | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT role_id FROM roles WHERE role_name = ?`,
      [roleName]
    );
    return rows[0]?.role_id ?? null;
  },

  async create(email: string, passwordHash: string, roleId: number): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)`,
      [email, passwordHash, roleId]
    );
    return result.insertId;
  },

  async updateLastLogin(userId: number): Promise<void> {
    await pool.query(`UPDATE users SET last_login_at = NOW() WHERE user_id = ?`, [userId]);
  },
};
