import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { z } from 'zod';

import { AppError } from '../../errors/app-error.js';
import { prisma } from '../../lib/prisma.js';
import { createStaffSchema, setScheduleSchema } from './staff.schemas.js';

export async function createStaff(request: Request, response: Response): Promise<void> {
  const input = createStaffSchema.parse(request.body);
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

  if (existingUser) {
    throw new AppError('Email is already registered.', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const staffProfile = await prisma.staffProfile.create({
    data: {
      user: {
        create: {
          name: input.name,
          email: input.email,
          passwordHash,
          role: 'STAFF',
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  response.status(201).json({ data: { staff: staffProfile } });
}

export async function listStaff(_request: Request, response: Response): Promise<void> {
  const staff = await prisma.staffProfile.findMany({
    where: { isActive: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      schedules: {
        orderBy: { dayOfWeek: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  response.status(200).json({ data: { staff } });
}

export async function setSchedule(request: Request, response: Response): Promise<void> {
  const staffProfileId = z.string().cuid().parse(request.params.staffProfileId);
  const input = setScheduleSchema.parse(request.body);
  const staffProfile = await prisma.staffProfile.findUnique({ where: { id: staffProfileId } });

  if (!staffProfile) {
    throw new AppError('Staff member not found.', 404);
  }

  const schedule = await prisma.workingSchedule.upsert({
    where: {
      staffProfileId_dayOfWeek: {
        staffProfileId,
        dayOfWeek: input.dayOfWeek,
      },
    },
    create: {
      staffProfileId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
    },
    update: {
      startTime: input.startTime,
      endTime: input.endTime,
    },
  });

  response.status(200).json({ data: { schedule } });
}
