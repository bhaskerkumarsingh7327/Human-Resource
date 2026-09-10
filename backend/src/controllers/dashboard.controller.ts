import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { EmployeeModel } from '../models/employee.model';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const DashboardController = {
  overview: asyncHandler(async (req: Request, res: Response) => {
    const now = new Date();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();
    const data = await DashboardService.overview(month, year);
    sendSuccess(res, 200, 'Dashboard overview fetched', data);
  }),

  teamSummary: asyncHandler(async (req: Request, res: Response) => {
    const employee = await EmployeeModel.findByUserId(req.user!.userId);
    if (!employee) throw new AppError('No employee profile linked to this account', 404);

    const data = await DashboardService.teamSummary(employee.employee_id);
    sendSuccess(res, 200, 'Team summary fetched', data);
  }),
};