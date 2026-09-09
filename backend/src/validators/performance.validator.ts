import { z } from 'zod';

export const createReviewSchema = z.object({
  employeeId: z.number().int(),
  reviewPeriod: z.string().min(3), // e.g. '2026-Q3'
  rating: z.number().min(0).max(5),
  feedback: z.string().optional(),
  goalsNextPeriod: z.string().optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().min(0).max(5).optional(),
  feedback: z.string().optional(),
  goalsNextPeriod: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;