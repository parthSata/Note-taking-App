import { z } from 'zod';

export const createNoteSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    shareType: z.enum(['ONE_TIME', 'TIME_BASED']),
    accessType: z.enum(['PUBLIC', 'PASSWORD']),
    expiresAt: z.string().datetime({ message: 'Invalid expiry date' }),
  })
  .refine((data) => new Date(data.expiresAt) > new Date(), {
    message: 'Expiry must be in the future',
    path: ['expiresAt'],
  });

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
