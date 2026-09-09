import { Request, Response } from 'express';
import { AttendanceService } from '../services/attendance.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const AttendanceController = {
  checkIn: asyncHandler(async (req: Request, res: Response) => {
    const record = await AttendanceService.checkIn(req.user!.userId);
    sendSuccess(res, 201, 'Checked in successfully', record);
  }),

  checkOut: asyncHandler(async (req: Request, res: Response) => {
    const record = await AttendanceService.checkOut(req.user!.userId);
    sendSuccess(res, 200, 'Checked out successfully', record);
  }),

  myHistory: asyncHandler(async (req: Request, res: Response) => {
    const query = (req as any).validatedQuery;
    const history = await AttendanceService.myHistory(req.user!.userId, query);
    sendSuccess(res, 200, 'Attendance history fetched', history);
  }),

  employeeHistory: asyncHandler(async (req: Request, res: Response) => {
    const query = (req as any).validatedQuery;
    const history = await AttendanceService.employeeHistory(Number(req.params.employeeId), query);
    sendSuccess(res, 200, 'Employee attendance history fetched', history);
  }),

  monthlyReport: asyncHandler(async (req: Request, res: Response) => {
    const query = (req as any).validatedQuery;
    const report = await AttendanceService.monthlyReport(query);
    sendSuccess(res, 200, 'Monthly attendance report fetched', report);
  }),
};