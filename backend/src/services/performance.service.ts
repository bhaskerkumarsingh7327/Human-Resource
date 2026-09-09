import { PerformanceModel } from '../models/performance.model';
import { EmployeeModel } from '../models/employee.model';
import { AppError } from '../utils/AppError';
import { CreateReviewInput, UpdateReviewInput } from '../validators/performance.validator';

async function resolveEmployeeId(userId: number): Promise<number> {
  const employee = await EmployeeModel.findByUserId(userId);
  if (!employee) throw new AppError('No employee profile linked to this account', 404);
  return employee.employee_id;
}

export const PerformanceService = {
  async create(reviewerUserId: number, input: CreateReviewInput) {
    const reviewerId = await resolveEmployeeId(reviewerUserId);
    const id = await PerformanceModel.create(
      input.employeeId,
      reviewerId,
      input.reviewPeriod,
      input.rating,
      input.feedback,
      input.goalsNextPeriod
    );
    return PerformanceModel.findById(id);
  },

  async getById(id: number) {
    const review = await PerformanceModel.findById(id);
    if (!review) throw new AppError('Performance review not found', 404);
    return review;
  },

  async employeeHistory(employeeId: number) {
    return PerformanceModel.findByEmployee(employeeId);
  },

  async myHistory(userId: number) {
    const employeeId = await resolveEmployeeId(userId);
    return PerformanceModel.findByEmployee(employeeId);
  },

  async update(id: number, input: UpdateReviewInput) {
    await this.getById(id);
    await PerformanceModel.update(id, input);
    return this.getById(id);
  },
};