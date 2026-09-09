import { DepartmentModel } from '../models/department.model';
import { AppError } from '../utils/AppError';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../validators/department.validator';

export const DepartmentService = {
  async list() {
    return DepartmentModel.findAll();
  },

  async getById(id: number) {
    const dept = await DepartmentModel.findById(id);
    if (!dept) throw new AppError('Department not found', 404);
    return dept;
  },

  async create(input: CreateDepartmentInput) {
    const existing = await DepartmentModel.findByName(input.departmentName);
    if (existing) throw new AppError('A department with this name already exists', 409);
    const id = await DepartmentModel.create(input.departmentName, input.description);
    return this.getById(id);
  },

  async update(id: number, input: UpdateDepartmentInput) {
    await this.getById(id);
    await DepartmentModel.update(id, input);
    return this.getById(id);
  },

  async remove(id: number) {
    await this.getById(id);
    await DepartmentModel.delete(id);
  },

  async assignEmployee(departmentId: number, employeeId: number) {
    await this.getById(departmentId);
    await DepartmentModel.assignEmployee(employeeId, departmentId);
  },
};