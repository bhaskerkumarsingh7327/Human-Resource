import { AttendanceModel } from '../models/attendance.model';
import { EmployeeModel } from '../models/employee.model';
import { AppError } from '../utils/AppError';
import { AttendanceHistoryQuery, AttendanceReportQuery } from '../validators/attendance.validator';

async function resolveEmployeeId(userId: number): Promise<number> {
  const employee = await EmployeeModel.findByUserId(userId);
  if (!employee) throw new AppError('No employee profile linked to this account', 404);
  return employee.employee_id;
}

export const AttendanceService = {
  async checkIn(userId: number) {
    const employeeId = await resolveEmployeeId(userId);
    const existing = await AttendanceModel.findToday(employeeId);
    if (existing) throw new AppError('You have already checked in today', 409);
    await AttendanceModel.checkIn(employeeId);
    return AttendanceModel.findToday(employeeId);
  },

  async checkOut(userId: number) {
    const employeeId = await resolveEmployeeId(userId);
    const existing = await AttendanceModel.findToday(employeeId);
    if (!existing) throw new AppError('You have not checked in today', 400);
    if (existing.check_out_time) throw new AppError('You have already checked out today', 409);
    await AttendanceModel.checkOut(employeeId);
    return AttendanceModel.findToday(employeeId);
  },

  async myHistory(userId: number, query: AttendanceHistoryQuery) {
    const employeeId = await resolveEmployeeId(userId);
    return AttendanceModel.findHistory(employeeId, query.month, query.year);
  },

  async employeeHistory(employeeId: number, query: AttendanceHistoryQuery) {
    return AttendanceModel.findHistory(employeeId, query.month, query.year);
  },

  async monthlyReport(query: AttendanceReportQuery) {
    return AttendanceModel.findMonthlyReport(query.month, query.year, query.departmentId);
  },
};