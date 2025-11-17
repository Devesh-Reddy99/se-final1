import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validationResult } from 'express-validator';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';

const prisma = new PrismaClient();

export const createTutor = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg, 400);
  }

  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  // Check if user already has a tutor profile
  const existing = await prisma.tutor.findUnique({
    where: { userId: req.user.id },
  });

  if (existing) {
    throw new AppError('Tutor profile already exists', 409);
  }

  const { bio, subjects, hourlyRate, experience, education } = req.body;

  const tutor = await prisma.tutor.create({
    data: {
      userId: req.user.id,
      bio,
      subjects,
      hourlyRate: parseFloat(hourlyRate),
      experience: experience ? parseInt(experience) : undefined,
      education,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });

  res.status(201).json({
    status: 'success',
    data: { tutor },
  });
};

export const getTutors = async (req: Request, res: Response) => {
  const { subject, minRate, maxRate, page = 1, limit = 10 } = req.query;

  const where: any = { isActive: true };

  if (subject) {
    where.subjects = {
      has: subject as string,
    };
  }

  if (minRate || maxRate) {
    where.hourlyRate = {};
    if (minRate) where.hourlyRate.gte = parseFloat(minRate as string);
    if (maxRate) where.hourlyRate.lte = parseFloat(maxRate as string);
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [tutors, total] = await Promise.all([
    prisma.tutor.findMany({
      where,
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { rating: 'desc' },
    }),
    prisma.tutor.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      tutors,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    },
  });
};

export const getTutorById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const tutor = await prisma.tutor.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          email: true,
        },
      },
      slots: {
        where: {
          isBooked: false,
          startTime: { gte: new Date() },
        },
        orderBy: { startTime: 'asc' },
        take: 20,
      },
    },
  });

  if (!tutor) {
    throw new AppError('Tutor not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { tutor },
  });
};

export const updateTutor = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const { id } = req.params;

  // Verify ownership
  const tutor = await prisma.tutor.findUnique({ where: { id } });
  if (!tutor) {
    throw new AppError('Tutor not found', 404);
  }

  if (tutor.userId !== req.user.id) {
    throw new AppError('Forbidden', 403);
  }

  const { bio, subjects, hourlyRate, experience, education, isActive } = req.body;

  const updated = await prisma.tutor.update({
    where: { id },
    data: {
      ...(bio !== undefined && { bio }),
      ...(subjects && { subjects }),
      ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
      ...(experience !== undefined && { experience: parseInt(experience) }),
      ...(education !== undefined && { education }),
      ...(isActive !== undefined && { isActive }),
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
    },
  });

  res.status(200).json({
    status: 'success',
    data: { tutor: updated },
  });
};
