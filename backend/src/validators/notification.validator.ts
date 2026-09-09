import { z } from 'zod';

export const createNotificationSchema = z.object({
  userId: z.number().int(),
  title: z.string().min(1).max(150),
  message: z.string().min(1).max(500),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;