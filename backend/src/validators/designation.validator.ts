import { z } from 'zod';

export const createDesignationSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  level: z.number().int().min(1).max(10).optional(),
});

export const updateDesignationSchema = z.object({
  title: z.string().min(2).optional(),
  level: z.number().int().min(1).max(10).optional(),
});

export type CreateDesignationInput = z.infer<typeof createDesignationSchema>;
export type UpdateDesignationInput = z.infer<typeof updateDesignationSchema>;