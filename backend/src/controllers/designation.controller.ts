import { Request, Response } from 'express';
import { DesignationService } from '../services/designation.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const DesignationController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const designations = await DesignationService.list();
    sendSuccess(res, 200, 'Designations fetched', designations);
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const designation = await DesignationService.getById(Number(req.params.id));
    sendSuccess(res, 200, 'Designation fetched', designation);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const designation = await DesignationService.create(req.body);
    sendSuccess(res, 201, 'Designation created', designation);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const designation = await DesignationService.update(Number(req.params.id), req.body);
    sendSuccess(res, 200, 'Designation updated', designation);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await DesignationService.remove(Number(req.params.id));
    sendSuccess(res, 200, 'Designation deleted', null);
  }),
};