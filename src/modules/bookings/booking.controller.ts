import type { Request, Response } from 'express';
import { z } from 'zod';

import { AppError } from '../../errors/app-error.js';
import { prisma } from '../../lib/prisma.js';
import { cancelBookingSchema, createBookingSchema } from './booking.schemas.js';

function getMinutesSinceMidnight(date: Date): number {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function getMinutesFromTime(value: string): number {
  const hours = Number(value.slice(0, 2));
  const minutes = Number(value.slice(3, 5));
  return hours * 60 + minutes;
}

export async function createBooking(request: Request, response: Response): Promise<void> {
  const input = createBookingSchema.parse(request.body);
  const customerId = request.auth?.userId;

  if (!customerId) {
    throw new AppError('Authentication token is required.', 401);
  }

  const booking = await prisma.$transaction(
    async (transaction) => {
      const [service, staffProfile] = await Promise.all([
        transaction.service.findFirst({
          where: { id: input.serviceId, isActive: true },
        }),
        transaction.staffProfile.findFirst({
          where: { id: input.staffProfileId, isActive: true },
        }),
      ]);

      if (!service) {
        throw new AppError('Active service not found.', 404);
      }

      if (!staffProfile) {
        throw new AppError('Active staff member not found.', 404);
      }

      const endAt = new Date(input.startAt.getTime() + service.durationMinutes * 60_000);
      const dayOfWeek = input.startAt.getUTCDay();
      const schedule = await transaction.workingSchedule.findUnique({
        where: {
          staffProfileId_dayOfWeek: {
            staffProfileId: staffProfile.id,
            dayOfWeek,
          },
        },
      });

      const startMinutes = getMinutesSinceMidnight(input.startAt);
      const endMinutes = getMinutesSinceMidnight(endAt);

      if (
        !schedule ||
        endAt.getUTCDate() !== input.startAt.getUTCDate() ||
        startMinutes < getMinutesFromTime(schedule.startTime) ||
        endMinutes > getMinutesFromTime(schedule.endTime)
      ) {
        throw new AppError('The selected time is outside the staff working hours.', 400);
      }

      const overlappingBooking = await transaction.booking.findFirst({
        where: {
          staffProfileId: staffProfile.id,
          status: { in: ['PENDING', 'CONFIRMED'] },
          startAt: { lt: endAt },
          endAt: { gt: input.startAt },
        },
      });

      if (overlappingBooking) {
        throw new AppError('This staff member already has a booking at that time.', 409);
      }

      return transaction.booking.create({
        data: {
          customerId,
          serviceId: service.id,
          staffProfileId: staffProfile.id,
          startAt: input.startAt,
          endAt,
        },
        include: {
          service: true,
          staffProfile: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      });
    },
    { isolationLevel: 'Serializable' },
  );

  response.status(201).json({ data: { booking } });
}

export async function listMyBookings(request: Request, response: Response): Promise<void> {
  const customerId = request.auth?.userId;

  if (!customerId) {
    throw new AppError('Authentication token is required.', 401);
  }

  const bookings = await prisma.booking.findMany({
    where: { customerId },
    include: {
      service: true,
      staffProfile: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { startAt: 'asc' },
  });

  response.status(200).json({ data: { bookings } });
}

export async function cancelBooking(request: Request, response: Response): Promise<void> {
  const bookingId = z.string().cuid().parse(request.params.bookingId);
  const input = cancelBookingSchema.parse(request.body);
  const customerId = request.auth?.userId;

  if (!customerId) {
    throw new AppError('Authentication token is required.', 401);
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId },
  });

  if (!booking) {
    throw new AppError('Booking not found.', 404);
  }

  if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
    throw new AppError('This booking cannot be cancelled.', 400);
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: 'CANCELLED',
      ...(input.cancellationReason !== undefined
        ? { cancellationReason: input.cancellationReason }
        : {}),
    },
  });

  response.status(200).json({ data: { booking: updatedBooking } });
}
