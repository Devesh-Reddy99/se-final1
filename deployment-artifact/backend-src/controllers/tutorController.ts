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
      subjects: JSON.stringify(Array.isArray(subjects) ? subjects : [subjects]),
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

  // Parse subjects JSON string to array
  const tutorWithParsedSubjects = {
    ...tutor,
    subjects: typeof tutor.subjects === 'string' ? JSON.parse(tutor.subjects) : tutor.subjects,
  };

  res.status(201).json({
    status: 'success',
    data: { tutor: tutorWithParsedSubjects },
  });
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const tutor = await prisma.tutor.findUnique({
    where: { userId: req.user.id },
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

  if (!tutor) {
    return res.status(404).json({
      status: 'error',
      message: 'Tutor profile not found',
    });
  }

  // Get total bookings count
  const totalBookings = await prisma.booking.count({
    where: {
      tutorId: tutor.id,
      status: { in: ['CONFIRMED', 'COMPLETED'] },
    },
  });

  // Parse subjects JSON string to array
  const tutorWithParsedSubjects = {
    ...tutor,
    subjects: typeof tutor.subjects === 'string' ? JSON.parse(tutor.subjects) : tutor.subjects,
    totalBookings,
  };

  return res.status(200).json({
    status: 'success',
    data: { tutor: tutorWithParsedSubjects },
  });
};

export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  // Find tutor by userId
  const tutor = await prisma.tutor.findUnique({
    where: { userId: req.user.id },
  });

  if (!tutor) {
    throw new AppError('Tutor profile not found', 404);
  }

  const { bio, subjects, hourlyRate, experience, education, isActive } = req.body;

  const updateData: any = {};
  if (bio !== undefined) updateData.bio = bio;
  if (subjects !== undefined) updateData.subjects = JSON.stringify(Array.isArray(subjects) ? subjects : [subjects]);
  if (hourlyRate !== undefined) updateData.hourlyRate = parseFloat(hourlyRate);
  if (experience !== undefined) updateData.experience = parseInt(experience);
  if (education !== undefined) updateData.education = education;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updated = await prisma.tutor.update({
    where: { id: tutor.id },
    data: updateData,
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

  // Parse subjects JSON string to array
  const updatedWithParsedSubjects = {
    ...updated,
    subjects: typeof updated.subjects === 'string' ? JSON.parse(updated.subjects) : updated.subjects,
  };

  return res.status(200).json({
    status: 'success',
    data: { tutor: updatedWithParsedSubjects },
  });
};

export const getTutors = async (req: Request, res: Response) => {
  const { subject, minRate, maxRate, page = 1, limit = 10 } = req.query;

  const where: any = { isActive: true };

  if (subject) {
    // SQLite doesn't support array operators, so we use LIKE for JSON string search
    where.subjects = {
      contains: subject as string,
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

  // Parse subjects JSON string to array and add totalBookings for each tutor
  const tutorsWithParsedSubjects = await Promise.all(tutors.map(async (tutor) => {
    const totalBookings = await prisma.booking.count({
      where: {
        tutorId: tutor.id,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
    });
    return {
      ...tutor,
      subjects: typeof tutor.subjects === 'string' ? JSON.parse(tutor.subjects) : tutor.subjects,
      totalBookings,
    };
  }));

  res.status(200).json({
    status: 'success',
    data: {
      tutors: tutorsWithParsedSubjects,
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

  // Get total bookings count
  const totalBookings = await prisma.booking.count({
    where: {
      tutorId: tutor.id,
      status: { in: ['CONFIRMED', 'COMPLETED'] },
    },
  });

  // Parse subjects JSON string to array
  const tutorWithParsedSubjects = {
    ...tutor,
    subjects: typeof tutor.subjects === 'string' ? JSON.parse(tutor.subjects) : tutor.subjects,
    totalBookings,
  };

  res.status(200).json({
    status: 'success',
    data: { tutor: tutorWithParsedSubjects },
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

  const updateData: any = {};
  if (bio !== undefined) updateData.bio = bio;
  if (subjects !== undefined) updateData.subjects = JSON.stringify(Array.isArray(subjects) ? subjects : [subjects]);
  if (hourlyRate !== undefined) updateData.hourlyRate = parseFloat(hourlyRate);
  if (experience !== undefined) updateData.experience = parseInt(experience);
  if (education !== undefined) updateData.education = education;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updated = await prisma.tutor.update({
    where: { id },
    data: updateData,
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

  // Parse subjects JSON string to array
  const updatedWithParsedSubjects = {
    ...updated,
    subjects: typeof updated.subjects === 'string' ? JSON.parse(updated.subjects) : updated.subjects,
  };

  res.status(200).json({
    status: 'success',
    data: { tutor: updatedWithParsedSubjects },
  });
};
