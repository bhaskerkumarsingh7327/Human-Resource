import bcrypt from 'bcrypt';
import { pool } from '../config/db';
import { EmployeeModel } from '../models/employee.model';
import { UserModel } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { CreateEmployeeInput, UpdateEmployeeInput, EmployeeQuery } from '../validators/employee.validator';

const SALT_ROUNDS = 12;

export const EmployeeService = {
  async list(filters: EmployeeQuery) {
    const { rows, total } = await EmployeeModel.findAll(filters);
    return {
      employees: rows,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  },

  async getById(id: number) {
    const employee = await EmployeeModel.findById(id);
    if (!employee) throw new AppError('Employee not found', 404);
    return employee;
  },

  async create(input: CreateEmployeeInput) {
    const existing = await UserModel.findByEmail(input.email);
    if (existing) throw new AppError('An account with this email already exists', 409);

    const roleId = await UserModel.getRoleIdByName(input.role);
    if (!roleId) throw new AppError('Invalid role specified', 400);

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
          (user_id, employee_code, first_name, last_name, phone, date_of_birth, gender,
           address, department_id, designation_id, manager_id, date_of_joining)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          employeeCode,
          input.firstName,
          input.lastName,
          input.phone ?? null,
          input.dateOfBirth ?? null,
          input.gender ?? null,
          input.address ?? null,
          input.departmentId ?? null,
          input.designationId ?? null,
          input.managerId ?? null,
          input.dateOfJoining,
        ]
      );

      await connection.commit();
      const [newEmpRows]: any = await connection.query(
        `SELECT employee_id FROM employees WHERE user_id = ?`,
        [userId]
      );
      return this.getById(newEmpRows[0].employee_id);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async update(id: number, input: UpdateEmployeeInput) {
    await this.getById(id);
    await EmployeeModel.update(id, input);
    return this.getById(id);
  },

  async remove(id: number) {
    await this.getById(id);
    await EmployeeModel.delete(id);
  },

  async updatePhoto(id: number, photoUrl: string) {
    await this.getById(id);
    await EmployeeModel.updatePhoto(id, photoUrl);
    return this.getById(id);
  },
};