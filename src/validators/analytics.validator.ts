import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).optional().default('day'),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
