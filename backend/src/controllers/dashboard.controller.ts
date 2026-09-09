import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const DashboardController = {
  overview: asyncHandler(async (req: Request, res: Response) => {
    const now = new Date();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();
    const data = await DashboardService.overview(month, year);
    sendSuccess(res, 200, 'Dashboard overview fetched', data);
  }),
};