import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.password,
  },
});

export async function sendPasswordResetEmail(toEmail: string, resetLink: string): Promise<void> {
  await transporter.sendMail({
    from: `"HRMS ERP" <${env.smtp.user}>`,
    to: toEmail,
    subject: 'Reset your HRMS password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2>Reset your password</h2>
        <p>We received a request to reset your HRMS account password. This link expires in 15 minutes.</p>
        <a href="${resetLink}" style="display:inline-block; background:#6366F1; color:white; padding:10px 20px; border-radius:6px; text-decoration:none; margin:16px 0;">
          Reset Password
        </a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}