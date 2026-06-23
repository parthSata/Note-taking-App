import { z } from 'zod';

export const unlockShareSchema = z.object({
  accessKey: z.string().optional(),
});

export type UnlockShareInput = z.infer<typeof unlockShareSchema>;
