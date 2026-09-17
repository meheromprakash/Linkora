import { z } from 'zod';

export const updateBioSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
      .optional(),
    displayName: z.string().min(1, 'Display name is required').max(50).optional(),
    bio: z.string().max(250, 'Bio cannot exceed 250 characters').optional(),
    avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
    theme: z.enum(['minimal-light', 'dark-slate', 'gradient-neon']).optional(),
    links: z
      .array(
        z.object({
          id: z.string(),
          title: z.string().min(1, 'Link title is required'),
          url: z.string().url('Invalid URL format'),
          icon: z.string().optional(),
          shortLinkId: z.string().optional(),
          isActive: z.boolean(),
          order: z.number(),
        })
      )
      .optional(),
    socials: z
      .object({
        twitter: z.string().optional(),
        github: z.string().optional(),
        linkedin: z.string().optional(),
        instagram: z.string().optional(),
        youtube: z.string().optional(),
        website: z.string().optional(),
      })
      .optional(),
  }),
});
