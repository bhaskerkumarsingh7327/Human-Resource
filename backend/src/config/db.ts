import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

export async function testConnection(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    console.log('✅ MySQL connection pool established');
  } finally {
    conn.release();
  }
}