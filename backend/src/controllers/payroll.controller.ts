import { Request, Response } from 'express';
import { PayrollService } from '../services/payroll.service';
import { sendSuccess } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const PayrollController = {
  setSalary: asyncHandler(async (req: Request, res: Response) => {
    const salary = await PayrollService.setSalary(Number(req.params.employeeId), req.body);
    sendSuccess(res, 200, 'Salary structure saved', salary);
  }),

  getSalary: asyncHandler(async (req: Request, res: Response) => {
    const salary = await PayrollService.getSalary(Number(req.params.employeeId));
    sendSuccess(res, 200, 'Salary structure fetched', salary);
  }),

  generate: asyncHandler(async (req: Request, res: Response) => {
    const results = await PayrollService.generate(req.body);
    sendSuccess(res, 201, `Payroll generated for ${results.length} employee(s)`, results);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const query = (req as any).validatedQuery;
    const result = await PayrollService.list(query);
    sendSuccess(res, 200, 'Payroll records fetched', result);
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const record = await PayrollService.getById(Number(req.params.id));
    sendSuccess(res, 200, 'Payroll record fetched', record);
  }),

  myPayslips: asyncHandler(async (req: Request, res: Response) => {
    const payslips = await PayrollService.myPayslips(req.user!.userId);
    sendSuccess(res, 200, 'Your payslips fetched', payslips);
  }),

  markPaid: asyncHandler(async (req: Request, res: Response) => {
    const record = await PayrollService.markPaid(Number(req.params.id));
    sendSuccess(res, 200, 'Payroll marked as paid', record);
  }),
};