import { LeaveTypeModel, LeaveRequestModel, LeaveBalanceModel } from '../models/leave.model';
import { EmployeeModel } from '../models/employee.model';
import { AppError } from '../utils/AppError';
import { CreateLeaveTypeInput, ApplyLeaveInput, LeaveQuery } from '../validators/leave.validator';

function daysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

async function resolveEmployeeId(userId: number): Promise<number> {
  const employee = await EmployeeModel.findByUserId(userId);
  if (!employee) throw new AppError('No employee profile linked to this account', 404);
  return employee.employee_id;
}

export const LeaveService = {
  async listTypes() {
    return LeaveTypeModel.findAll();
  },

  async createType(input: CreateLeaveTypeInput) {
    const id = await LeaveTypeModel.create(input.name, input.defaultDaysPerYear, input.isPaid);
    return LeaveTypeModel.findById(id);
  },

  async apply(userId: number, input: ApplyLeaveInput) {
    const employeeId = await resolveEmployeeId(userId);

    const leaveType = await LeaveTypeModel.findById(input.leaveTypeId);
    if (!leaveType) throw new AppError('Invalid leave type', 400);

    const totalDays = daysBetween(input.startDate, input.endDate);
    if (totalDays <= 0) throw new AppError('End date must be on or after start date', 400);

    const year = new Date(input.startDate).getFullYear();
    const balance = await LeaveBalanceModel.getOrCreate(
      employeeId,
      input.leaveTypeId,
      year,
      leaveType.default_days_per_year
    );

    const remaining = Number(balance.allocated_days) - Number(balance.used_days);
    if (totalDays > remaining) {
      throw new AppError(`Insufficient leave balance. Remaining: ${remaining} day(s)`, 400);
    }

    const id = await LeaveRequestModel.create(
      employeeId,
      input.leaveTypeId,
      input.startDate,
      input.endDate,
      totalDays,
      input.reason
    );
    return LeaveRequestModel.findById(id);
  },

  async myRequests(userId: number) {
    const employeeId = await resolveEmployeeId(userId);
    return LeaveRequestModel.findByEmployee(employeeId);
  },

  async list(filters: LeaveQuery) {
    const { rows, total } = await LeaveRequestModel.findAll(filters);
    return {
      requests: rows,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  },

  async approve(leaveRequestId: number, approverUserId: number) {
    const request = await LeaveRequestModel.findById(leaveRequestId);
    if (!request) throw new AppError('Leave request not found', 404);
    if (request.status !== 'PENDING') throw new AppError('Only pending requests can be approved', 400);

    const approverEmployeeId = await resolveEmployeeId(approverUserId);
    const year = new Date(request.start_date).getFullYear();

    await LeaveRequestModel.updateStatus(leaveRequestId, 'APPROVED', approverEmployeeId);
    await LeaveBalanceModel.incrementUsedDays(request.employee_id, request.leave_type_id, year, request.total_days);

    return LeaveRequestModel.findById(leaveRequestId);
  },

  async reject(leaveRequestId: number, approverUserId: number) {
    const request = await LeaveRequestModel.findById(leaveRequestId);
    if (!request) throw new AppError('Leave request not found', 404);
    if (request.status !== 'PENDING') throw new AppError('Only pending requests can be rejected', 400);

    const approverEmployeeId = await resolveEmployeeId(approverUserId);
    await LeaveRequestModel.updateStatus(leaveRequestId, 'REJECTED', approverEmployeeId);
    return LeaveRequestModel.findById(leaveRequestId);
  },

  async myBalance(userId: number, year: number) {
    const employeeId = await resolveEmployeeId(userId);
    return LeaveBalanceModel.findByEmployee(employeeId, year);
  },
};