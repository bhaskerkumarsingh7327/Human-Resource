import { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const EmployeeController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = (req as any).validatedQuery;
    const result = await EmployeeService.list(query);
    sendSuccess(res, 200, 'Employees fetched', result);
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const employee = await EmployeeService.getById(Number(req.params.id));
    sendSuccess(res, 200, 'Employee fetched', employee);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const employee = await EmployeeService.create(req.body);
    sendSuccess(res, 201, 'Employee created', employee);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const employee = await EmployeeService.update(Number(req.params.id), req.body);
    sendSuccess(res, 200, 'Employee updated', employee);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await EmployeeService.remove(Number(req.params.id));
    sendSuccess(res, 200, 'Employee deleted', null);
  }),

  uploadPhoto: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    const employee = await EmployeeService.updatePhoto(Number(req.params.id), photoUrl);
    sendSuccess(res, 200, 'Profile photo updated', employee);
  }),
};