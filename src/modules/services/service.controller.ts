import type { Request, Response } from 'express';
import { z } from 'zod';

import { AppError } from '../../errors/app-error.js';
import { prisma } from '../../lib/prisma.js';
import { createServiceSchema, updateServiceSchema } from './service.schemas.js';

export async function createService(request: Request, response: Response): Promise<void> {
  const input = createServiceSchema.parse(request.body);
  const service = await prisma.service.create({
    data: {
      name: input.name,
      durationMinutes: input.durationMinutes,
      price: input.price,
      ...(input.description !== undefined ? { description: input.description } : {}),
    },
  });

  response.status(201).json({ data: { service } });
}

export async function listServices(_request: Request, response: Response): Promise<void> {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  response.status(200).json({ data: { services } });
}

export async function getService(request: Request, response: Response): Promise<void> {
  const serviceId = z.string().cuid().parse(request.params.id);
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new AppError('Service not found.', 404);
  }

  response.status(200).json({ data: { service } });
}

export async function updateService(request: Request, response: Response): Promise<void> {
  const serviceId = z.string().cuid().parse(request.params.id);
  const input = updateServiceSchema.parse(request.body);
  const existingService = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!existingService) {
    throw new AppError('Service not found.', 404);
  }

  const service = await prisma.service.update({
    where: { id: existingService.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.durationMinutes !== undefined ? { durationMinutes: input.durationMinutes } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    },
  });

  response.status(200).json({ data: { service } });
}
