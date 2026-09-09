import { pool } from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface NotificationRow extends RowDataPacket {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

export const NotificationModel = {
  async create(userId: number, title: string, message: string): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
      [userId, title, message]
    );
    return result.insertId;
  },

  async findByUser(userId: number, unreadOnly: boolean): Promise<NotificationRow[]> {
    const whereClause = unreadOnly ? 'AND is_read = FALSE' : '';
    const [rows] = await pool.query<NotificationRow[]>(
      `SELECT * FROM notifications WHERE user_id = ? ${whereClause} ORDER BY created_at DESC`,
      [userId]
    );
    return rows;
  },

  async markAsRead(notificationId: number, userId: number): Promise<void> {
    await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?`,
      [notificationId, userId]
    );
  },

  async markAllAsRead(userId: number): Promise<void> {
    await pool.query(`UPDATE notifications SET is_read = TRUE WHERE user_id = ?`, [userId]);
  },
};