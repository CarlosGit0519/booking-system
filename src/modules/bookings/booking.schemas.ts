import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.string().cuid(),
  staffProfileId: z.string().cuid(),
  startAt: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Booking time must be in the future.',
  }),
});

export const cancelBookingSchema = z.object({
  cancellationReason: z.string().trim().min(2).max(500).optional(),
});
