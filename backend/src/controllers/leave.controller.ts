import { Request, Response } from 'express';
import { LeaveService } from '../services/leave.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const LeaveController = {
  listTypes: asyncHandler(async (_req: Request, res: Response) => {
    const types = await LeaveService.listTypes();
    sendSuccess(res, 200, 'Leave types fetched', types);
  }),

  createType: asyncHandler(async (req: Request, res: Response) => {
    const type = await LeaveService.createType(req.body);
    sendSuccess(res, 201, 'Leave type created', type);
  }),

  apply: asyncHandler(async (req: Request, res: Response) => {
    const request = await LeaveService.apply(req.user!.userId, req.body);
    sendSuccess(res, 201, 'Leave request submitted', request);
  }),

  myRequests: asyncHandler(async (req: Request, res: Response) => {
    const requests = await LeaveService.myRequests(req.user!.userId);
    sendSuccess(res, 200, 'Your leave requests fetched', requests);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const query = (req as any).validatedQuery;
    const result = await LeaveService.list(query);
    sendSuccess(res, 200, 'Leave requests fetched', result);
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const request = await LeaveService.approve(Number(req.params.id), req.user!.userId);
    sendSuccess(res, 200, 'Leave request approved', request);
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    const request = await LeaveService.reject(Number(req.params.id), req.user!.userId);
    sendSuccess(res, 200, 'Leave request rejected', request);
  }),

  myBalance: asyncHandler(async (req: Request, res: Response) => {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const balance = await LeaveService.myBalance(req.user!.userId, year);
    sendSuccess(res, 200, 'Leave balance fetched', balance);
  }),
};