
import { z } from 'zod';

export const RequestUploadSchema = z.object({
  filename: z.string().min(1),
  mime: z.string().min(1),
  size: z.number().int().positive().max(50 * 1024 * 1024),
});

export const CompleteSchema = z.object({
  title: z.string().min(1),
  key: z.string().min(1),
  mime: z.string().min(1),
  size: z.number().int().positive(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  type: z.enum(['IMAGE','VIDEO','AUDIO','TEXT'])
});
