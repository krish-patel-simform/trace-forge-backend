import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').trim(),
    // websiteUrl is optional and we also accept an empty string for flexibility
    websiteUrl: z.union([z.string().url('Must be a valid URL'), z.literal('')]).optional(),
    description: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name cannot be empty').trim().optional(),
    websiteUrl: z.union([z.string().url('Must be a valid URL'), z.literal('')]).optional(),
    description: z.string().optional(),
    settings: z.object({
      timezone: z.string().optional(),
      dataRetentionDays: z.number().int().min(1).max(365).optional(),
    }).optional(),
  }),
});
