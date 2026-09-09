// import bcrypt from 'bcrypt';
// import { pool } from '../config/db';
// import { UserModel } from '../models/user.model';
// import { EmployeeModel } from '../models/employee.model';
// import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
// import { AppError } from '../utils/AppError';
// import { RegisterInput, LoginInput } from '../validators/auth.validator';
// import { RoleName } from '../types';
// import crypto from 'crypto';
// import { PasswordResetModel } from '../models/passwordReset.model';
// import { sendPasswordResetEmail } from '../utils/mailer';
// import { env } from '../config/env';
// import { ForgotPasswordInput, ResetPasswordInput } from '../validators/auth.validator';

// const SALT_ROUNDS = 12;

// export const AuthService = {
//   async register(input: RegisterInput) {
//     const existing = await UserModel.findByEmail(input.email);
//     if (existing) {
//       throw new AppError('An account with this email already exists', 409);
//     }

//     const roleId = await UserModel.getRoleIdByName(input.role);
//     if (!roleId) {
//       throw new AppError('Invalid role specified', 400);
//     }

//     const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

//     // Use a transaction so user + employee are created atomically.
//     const connection = await pool.getConnection();
//     try {
//       await connection.beginTransaction();

//       const [userResult]: any = await connection.query(
//         `INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)`,
//         [input.email, passwordHash, roleId]
//       );
//       const userId = userResult.insertId;

//       const employeeCode = await EmployeeModel.generateNextEmployeeCode();

//       await connection.query(
//         `INSERT INTO employees
//           (user_id, employee_code, first_name, last_name, department_id, designation_id, date_of_joining)
//          VALUES (?, ?, ?, ?, ?, ?, ?)`,
//         [
//           userId,
//           employeeCode,
//           input.firstName,
//           input.lastName,
//           input.departmentId ?? null,
//           input.designationId ?? null,
//           input.dateOfJoining,
//         ]
//       );

//       await connection.commit();

//       const payload = { userId, email: input.email, role: input.role as RoleName };
//       return {
//         user: { userId, email: input.email, role: input.role, employeeCode },
//         accessToken: generateAccessToken(payload),
//         refreshToken: generateRefreshToken(payload),
//       };
//     } catch (err) {
//       await connection.rollback();
//       throw err;
//     } finally {
//       connection.release();
//     }
//   },

//   async login(input: LoginInput) {
//     const user = await UserModel.findByEmail(input.email);
//     if (!user || !user.is_active) {
//       throw new AppError('Invalid email or password', 401);
//     }

//     const isMatch = await bcrypt.compare(input.password, user.password_hash);
//     if (!isMatch) {
//       throw new AppError('Invalid email or password', 401);
//     }

//     await UserModel.updateLastLogin(user.user_id);

//     const payload = {
//       userId: user.user_id,
//       email: user.email,
//       role: user.role_name as RoleName,
//     };
    

//     return {
//       user: { userId: user.user_id, email: user.email, role: user.role_name },
//       accessToken: generateAccessToken(payload),
//       refreshToken: generateRefreshToken(payload),
//     };
//   },
// };


import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { pool } from '../config/db';
import { UserModel } from '../models/user.model';
import { EmployeeModel } from '../models/employee.model';
import { PasswordResetModel } from '../models/passwordReset.model';
import { sendPasswordResetEmail } from '../utils/mailer';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validators/auth.validator';
import { RoleName } from '../types';

const SALT_ROUNDS = 12;

export const AuthService = {
  async register(input: RegisterInput) {
    const existing = await UserModel.findByEmail(input.email);
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const roleId = await UserModel.getRoleIdByName(input.role);
    if (!roleId) {
      throw new AppError('Invalid role specified', 400);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [userResult]: any = await connection.query(
        `INSERT INTO users (email, password_hash, role_id) VALUES (?, ?, ?)`,
        [input.email, passwordHash, roleId]
      );
      const userId = userResult.insertId;

      const employeeCode = await EmployeeModel.generateNextEmployeeCode();

      await connection.query(
        `INSERT INTO employees
          (user_id, employee_code, first_name, last_name, department_id, designation_id, date_of_joining)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          employeeCode,
          input.firstName,
          input.lastName,
          input.departmentId ?? null,
          input.designationId ?? null,
          input.dateOfJoining,
        ]
      );

      await connection.commit();

      const payload = { userId, email: input.email, role: input.role as RoleName };
      return {
        user: { userId, email: input.email, role: input.role, employeeCode },
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
      };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async login(input: LoginInput) {
    const user = await UserModel.findByEmail(input.email);
    if (!user || !user.is_active) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(input.password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    await UserModel.updateLastLogin(user.user_id);

    const payload = {
      userId: user.user_id,
      email: user.email,
      role: user.role_name as RoleName,
    };

    return {
      user: { userId: user.user_id, email: user.email, role: user.role_name },
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await UserModel.findByEmail(input.email);
    // Security: don't reveal whether the email exists or not
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await PasswordResetModel.invalidateAllForUser(user.user_id);
    await PasswordResetModel.create(user.user_id, tokenHash, expiresAt);

    const resetLink = `${env.frontendUrl}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetLink);

    return { message: 'If that email exists, a reset link has been sent.' };
  },

  async resetPassword(input: ResetPasswordInput) {
    const tokenHash = crypto.createHash('sha256').update(input.token).digest('hex');
    const resetRecord = await PasswordResetModel.findValidByHash(tokenHash);

    if (!resetRecord) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await pool.query(`UPDATE users SET password_hash = ? WHERE user_id = ?`, [
      passwordHash,
      resetRecord.user_id,
    ]);

    await PasswordResetModel.markUsed(resetRecord.token_id);
    return { message: 'Password reset successfully. You can now log in.' };
  },
};