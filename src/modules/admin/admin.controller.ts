import type { Request, Response } from 'express';
import { z } from 'zod';

import { AppError } from '../../errors/app-error.js';
import { prisma } from '../../lib/prisma.js';

const bookingsQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
});

export async function getDashboard(_request: Request, response: Response): Promise<void> {
  const [activeServices, activeStaff, pendingBookings, totalCustomers] = await Promise.all([
    prisma.service.count({ where: { isActive: true } }),
    prisma.staffProfile.count({ where: { isActive: true } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
  ]);

  response.status(200).json({
    data: {
      activeServices,
      activeStaff,
      pendingBookings,
      totalCustomers,
    },
  });
}

export async function listBookings(request: Request, response: Response): Promise<void> {
  const query = bookingsQuerySchema.parse(request.query);
  const bookings = await prisma.booking.findMany({
    ...(query.status ? { where: { status: query.status } } : {}),
    include: {
      customer: {
        select: { id: true, name: true, email: true },
      },
      service: {
        select: { id: true, name: true, durationMinutes: true, price: true },
      },
      staffProfile: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { startAt: 'desc' },
  });

  response.status(200).json({ data: { bookings } });
}

export async function listServices(_request: Request, response: Response): Promise<void> {
  const services = await prisma.service.findMany({
    orderBy: { name: 'asc' },
  });

  response.status(200).json({ data: { services } });
}

export async function updateBookingStatus(request: Request, response: Response): Promise<void> {
  const bookingId = z.string().cuid().parse(request.params.bookingId);
  const input = updateBookingStatusSchema.parse(request.body);
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    throw new AppError('Booking not found.', 404);
  }

  if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
    throw new AppError('A cancelled or completed booking cannot be changed.', 400);
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: { status: input.status },
  });

  response.status(200).json({ data: { booking: updatedBooking } });
}
