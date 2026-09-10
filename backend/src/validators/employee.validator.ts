import { z } from 'zod';

export const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  departmentId: z.number().int().optional(),
  designationId: z.number().int().optional(),
  managerId: z.number().int().optional(),
  dateOfJoining: z.string(),
});

export const updateEmployeeSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  departmentId: z.number().int().optional(),
  designationId: z.number().int().optional(),
  managerId: z.number().int().optional(),
  employmentStatus: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED']).optional(),
});

export const employeeQuerySchema = z.object({
  search: z.string().optional(),
  departmentId: z.coerce.number().int().optional(),
  designationId: z.coerce.number().int().optional(),
  managerId: z.coerce.number().int().optional(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'RESIGNED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeQuery = z.infer<typeof employeeQuerySchema>;