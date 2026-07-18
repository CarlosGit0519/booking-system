import { z } from 'zod';

const priceSchema = z.coerce.number().positive().max(10_000);
const durationSchema = z.coerce.number().int().min(5).max(480);

export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(2).max(500).optional(),
  durationMinutes: durationSchema,
  price: priceSchema,
});

export const updateServiceSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().min(2).max(500).nullable().optional(),
    durationMinutes: durationSchema.optional(),
    price: priceSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  });
