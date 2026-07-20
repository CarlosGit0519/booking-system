import type { Request, Response } from 'express';
import { z } from 'zod';

import { prisma } from '../../lib/prisma.js';

const bookingsQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
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
