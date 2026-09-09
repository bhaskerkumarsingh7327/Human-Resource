import { z } from 'zod';

export const setSalarySchema = z.object({
  basicSalary: z.number().positive(),
  hra: z.number().nonnegative().default(0),
  otherAllowances: z.number().nonnegative().default(0),
  effectiveFrom: z.string(), // e.g. '2026-09-01'
});

export const generatePayrollSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  employeeId: z.number().int().optional(), // if omitted, generates for all active employees
  deductions: z.number().nonnegative().default(0), // flat deduction applied (e.g. PF/tax), optional per-run
});

export const payrollQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  employeeId: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SetSalaryInput = z.infer<typeof setSalarySchema>;
export type GeneratePayrollInput = z.infer<typeof generatePayrollSchema>;
export type PayrollQuery = z.infer<typeof payrollQuerySchema>;