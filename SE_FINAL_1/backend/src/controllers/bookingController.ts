import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendBookingConfirmation, sendBookingCancellation } from '../services/emailService';

const prisma = new PrismaClient();

export const createBooking = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { slotId, subject, notes } = req.body;

  const result = await prisma.$transaction(async (tx: any) => {
    const slot = await tx.slot.findUnique({
      where: { id: slotId },
      include: {
        tutor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!slot) {
      throw new AppError('Slot not found', 404);
    }

    if (slot.isBooked) {
      throw new AppError('Slot is already booked', 409);
    }

    if (slot.startTime < new Date()) {
      throw new AppError('Cannot book past slots', 400);
    }

    await tx.slot.update({
      where: { id: slotId },
      data: { isBooked: true },
    });

    const booking = await tx.booking.create({
      data: {
        slotId,
        studentId: req.user!.id,
        tutorId: slot.tutorId,
        subject,
        notes,
        status: 'CONFIRMED',
      },
      include: {
        slot: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return booking;
  });

  setTimeout(() => {
    sendBookingConfirmation(result).catch((err) => console.error('Email error:', err));
  }, 0);

  res.status(201).json({
    status: 'success',
    data: { booking: result },
  });
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { status, page = 1, limit = 10 } = req.query;
  const where: any = {};

  if (req.user.role === 'STUDENT') {
    where.studentId = req.user.id;
  } else if (req.user.role === 'TUTOR') {
    const tutor = await prisma.tutor.findUnique({
      where: { userId: req.user.id },
    });
    if (tutor) {
      where.tutorId = tutor.id;
    }
  }

  if (status) {
    where.status = status;
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take,
      include: {
        slot: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    },
  });
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;
  const { reason } = req.body;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      slot: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      tutor: {
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.studentId !== req.user.id && booking.tutor.userId !== req.user.id) {
    throw new AppError('Forbidden', 403);
  }

  if (booking.status === 'CANCELLED') {
    throw new AppError('Booking is already cancelled', 400);
  }

  const updated = await prisma.$transaction(async (tx: any) => {
    const updatedBooking = await tx.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason,
      },
      include: {
        slot: true,
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    await tx.slot.update({
      where: { id: booking.slotId },
      data: { isBooked: false },
    });

    return updatedBooking;
  });

  setTimeout(() => {
    sendBookingCancellation(updated).catch((err) => console.error('Email error:', err));
  }, 0);

  res.status(200).json({
    status: 'success',
    data: { booking: updated },
  });
};
