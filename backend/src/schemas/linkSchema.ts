import { z } from 'zod';

export const createLinkSchema = z.object({
  body: z.object({
    originalUrl: z
      .string()
      .url('Please enter a valid destination URL (e.g., https://example.com)'),
    customSlug: z
      .string()
      .min(3, 'Custom slug must be at least 3 characters')
      .max(30, 'Custom slug cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Custom slug can only contain letters, numbers, hyphens, and underscores')
      .optional()
      .or(z.literal('')),
    title: z.string().max(100, 'Title cannot exceed 100 characters').optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateLinkSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Link ID is required'),
  }),
  body: z.object({
    originalUrl: z.string().url('Please enter a valid destination URL').optional(),
    title: z.string().max(100).optional(),
    isActive: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const queryLinksSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('10'),
    search: z.string().optional(),
  }),
});
