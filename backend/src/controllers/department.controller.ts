import { Request, Response } from 'express';
import { DepartmentService } from '../services/department.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const DepartmentController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const departments = await DepartmentService.list();
    sendSuccess(res, 200, 'Departments fetched', departments);
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const department = await DepartmentService.getById(Number(req.params.id));
    sendSuccess(res, 200, 'Department fetched', department);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const department = await DepartmentService.create(req.body);
    sendSuccess(res, 201, 'Department created', department);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const department = await DepartmentService.update(Number(req.params.id), req.body);
    sendSuccess(res, 200, 'Department updated', department);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await DepartmentService.remove(Number(req.params.id));
    sendSuccess(res, 200, 'Department deleted', null);
  }),

  assignEmployee: asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.body;
    await DepartmentService.assignEmployee(Number(req.params.id), Number(employeeId));
    sendSuccess(res, 200, 'Employee assigned to department', null);
  }),
};