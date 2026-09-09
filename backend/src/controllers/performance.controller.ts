import { Request, Response } from 'express';
import { PerformanceService } from '../services/performance.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const PerformanceController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const review = await PerformanceService.create(req.user!.userId, req.body);
    sendSuccess(res, 201, 'Performance review created', review);
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const review = await PerformanceService.getById(Number(req.params.id));
    sendSuccess(res, 200, 'Review fetched', review);
  }),

  employeeHistory: asyncHandler(async (req: Request, res: Response) => {
    const reviews = await PerformanceService.employeeHistory(Number(req.params.employeeId));
    sendSuccess(res, 200, 'Employee review history fetched', reviews);
  }),

  myHistory: asyncHandler(async (req: Request, res: Response) => {
    const reviews = await PerformanceService.myHistory(req.user!.userId);
    sendSuccess(res, 200, 'Your review history fetched', reviews);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const review = await PerformanceService.update(Number(req.params.id), req.body);
    sendSuccess(res, 200, 'Review updated', review);
  }),
};