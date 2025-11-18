import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const createSlot = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  // Get tutor profile
  const tutor = await prisma.tutor.findUnique({
    where: { userId: req.user.id },
  });

  if (!tutor) {
    throw new AppError('Tutor profile not found. Please create a tutor profile first.', 404);
  }

  const { startTime, endTime, duration, recurrence, recurrenceEnd, recurrenceCount } = req.body;

  const start = new Date(startTime);
  const end = new Date(endTime);

  // Validate times
  if (start >= end) {
    throw new AppError('End time must be after start time', 400);
  }

  if (start < new Date()) {
    throw new AppError('Cannot create slots in the past', 400);
  }

  // Check for overlaps
  const overlapping = await prisma.slot.findFirst({
    where: {
      tutorId: tutor.id,
      OR: [
        {
          AND: [
            { startTime: { lte: start } },
            { endTime: { gt: start } },
          ],
        },
        {
          AND: [
            { startTime: { lt: end } },
            { endTime: { gte: end } },
          ],
        },
        {
          AND: [
            { startTime: { gte: start } },
            { endTime: { lte: end } },
          ],
        },
      ],
    },
  });

  if (overlapping) {
    throw new AppError('Slot overlaps with existing slot', 409);
  }

  // Handle recurring slots
  if (recurrence && recurrence !== 'NONE') {
    const slots = [];
    const maxCount = recurrenceCount || 30;
    const recurEnd = recurrenceEnd ? new Date(recurrenceEnd) : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days default

    let currentStart = new Date(start);
    let currentEnd = new Date(end);
    let count = 0;

    while (currentStart < recurEnd && count < maxCount) {
      // Check overlap for each slot
      const overlap = await prisma.slot.findFirst({
        where: {
          tutorId: tutor.id,
          OR: [
            {
              AND: [
                { startTime: { lte: currentStart } },
                { endTime: { gt: currentStart } },
              ],
            },
            {
              AND: [
                { startTime: { lt: currentEnd } },
                { endTime: { gte: currentEnd } },
              ],
            },
          ],
        },
      });

      if (!overlap) {
        slots.push({
          tutorId: tutor.id,
          startTime: new Date(currentStart),
          endTime: new Date(currentEnd),
          duration: parseInt(duration) || Math.floor((currentEnd.getTime() - currentStart.getTime()) / 60000),
          recurrence,
          recurrenceEnd: recurEnd,
        });
        count++;
      }

      // Increment based on recurrence
      if (recurrence === 'DAILY') {
        currentStart.setDate(currentStart.getDate() + 1);
        currentEnd.setDate(currentEnd.getDate() + 1);
      } else if (recurrence === 'WEEKLY') {
        currentStart.setDate(currentStart.getDate() + 7);
        currentEnd.setDate(currentEnd.getDate() + 7);
      } else if (recurrence === 'MONTHLY') {
        currentStart.setMonth(currentStart.getMonth() + 1);
        currentEnd.setMonth(currentEnd.getMonth() + 1);
      }
    }

    const created = await prisma.slot.createMany({ data: slots });

    res.status(201).json({
      status: 'success',
      data: { count: created.count, message: `${created.count} recurring slots created` },
    });
  } else {
    // Create single slot
    const calculatedDuration = duration ? parseInt(duration) : Math.floor((end.getTime() - start.getTime()) / 60000);
    
    const slot = await prisma.slot.create({
      data: {
        tutorId: tutor.id,
        startTime: start,
        endTime: end,
        duration: calculatedDuration,
        recurrence: 'NONE',
      },
    });

    res.status(201).json({
      status: 'success',
      data: { slot },
    });
  }
};

export const getSlots = async (req: AuthRequest, res: Response) => {
  const { tutorId, startDate, endDate, available } = req.query;

  const where: any = {};

  if (tutorId) {
    where.tutorId = tutorId as string;
  }

  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) where.startTime.gte = new Date(startDate as string);
    if (endDate) where.startTime.lte = new Date(endDate as string);
  }

  if (available === 'true') {
    where.isBooked = false;
    where.startTime = { ...where.startTime, gte: new Date() };
  }

  const slots = await prisma.slot.findMany({
    where,
    include: {
      tutor: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  res.status(200).json({
    status: 'success',
    data: { slots },
  });
};

export const getMySlots = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  // Get tutor profile
  const tutor = await prisma.tutor.findUnique({
    where: { userId: req.user.id },
  });

  if (!tutor) {
    throw new AppError('Tutor profile not found', 404);
  }

  const slots = await prisma.slot.findMany({
    where: { tutorId: tutor.id },
    include: {
      booking: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  res.status(200).json({
    status: 'success',
    data: slots,
  });
};

export const updateSlot = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const { startTime, endTime, duration } = req.body;

  const slot = await prisma.slot.findUnique({
    where: { id },
    include: { tutor: true },
  });

  if (!slot) {
    throw new AppError('Slot not found', 404);
  }

  if (slot.tutor.userId !== req.user.id) {
    throw new AppError('Forbidden', 403);
  }

  if (slot.isBooked) {
    throw new AppError('Cannot update booked slot', 400);
  }

  const updated = await prisma.slot.update({
    where: { id },
    data: {
      ...(startTime && { startTime: new Date(startTime) }),
      ...(endTime && { endTime: new Date(endTime) }),
      ...(duration && { duration: parseInt(duration) }),
    },
  });

  res.status(200).json({
    status: 'success',
    data: { slot: updated },
  });
};

export const deleteSlot = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;

  const slot = await prisma.slot.findUnique({
    where: { id },
    include: { tutor: true },
  });

  if (!slot) {
    throw new AppError('Slot not found', 404);
  }

  if (slot.tutor.userId !== req.user.id) {
    throw new AppError('Forbidden', 403);
  }

  if (slot.isBooked) {
    throw new AppError('Cannot delete booked slot', 400);
  }

  await prisma.slot.delete({ where: { id } });

  res.status(200).json({
    status: 'success',
    message: 'Slot deleted successfully',
  });
};
