import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface PasswordResetRow extends RowDataPacket {
  token_id: number;
  user_id: number;
  token_hash: string;
  expires_at: string;
  used: number;
}

export const PasswordResetModel = {
  async create(userId: number, tokenHash: string, expiresAt: Date): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      [userId, tokenHash, expiresAt]
    );
    return result.insertId;
  },

  async findValidByHash(tokenHash: string): Promise<PasswordResetRow | null> {
    const [rows] = await pool.query<PasswordResetRow[]>(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = ? AND used = FALSE AND expires_at > NOW()`,
      [tokenHash]
    );
    return rows[0] ?? null;
  },

  async markUsed(tokenId: number): Promise<void> {
    await pool.query(`UPDATE password_reset_tokens SET used = TRUE WHERE token_id = ?`, [tokenId]);
  },

  async invalidateAllForUser(userId: number): Promise<void> {
    await pool.query(`UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ?`, [userId]);
  },
};