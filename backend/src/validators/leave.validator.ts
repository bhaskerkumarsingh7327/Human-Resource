import { z } from 'zod';

export const createLeaveTypeSchema = z.object({
  name: z.string().min(2),
  defaultDaysPerYear: z.number().int().min(0).default(12),
  isPaid: z.boolean().default(true),
});

export const applyLeaveSchema = z.object({
  leaveTypeId: z.number().int(),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().optional(),
});

export const leaveQuerySchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
  employeeId: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateLeaveTypeInput = z.infer<typeof createLeaveTypeSchema>;
export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;
export type LeaveQuery = z.infer<typeof leaveQuerySchema>;