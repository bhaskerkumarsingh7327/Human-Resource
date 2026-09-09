import { z } from 'zod';

export const createDepartmentSchema = z.object({
  departmentName: z.string().min(2, 'Department name is required'),
  description: z.string().optional(),
});

export const updateDepartmentSchema = z.object({
  departmentName: z.string().min(2).optional(),
  description: z.string().optional(),
  headEmployeeId: z.number().int().optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;