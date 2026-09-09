import { z } from 'zod';

export const attendanceHistoryQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const attendanceReportQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
  departmentId: z.coerce.number().int().optional(),
});

export type AttendanceHistoryQuery = z.infer<typeof attendanceHistoryQuerySchema>;
export type AttendanceReportQuery = z.infer<typeof attendanceReportQuerySchema>;