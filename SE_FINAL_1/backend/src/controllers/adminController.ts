import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createObjectCsvWriter } from 'csv-writer';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  const { role, search, page = 1, limit = 10 } = req.query;

  const where: any = {};

  if (role) {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
        tutorProfile: {
          select: {
            id: true,
            subjects: true,
            hourlyRate: true,
            rating: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    },
  });
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['STUDENT', 'TUTOR', 'ADMIN'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Prevent admin from deleting themselves
  if (id === req.user?.id) {
    throw new AppError('Cannot delete your own account', 400);
  }

  await prisma.user.delete({ where: { id } });

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
  });
};

export const getAllBookings = async (req: AuthRequest, res: Response) => {
  const { status, startDate, endDate, tutorId, studentId, page = 1, limit = 10 } = req.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (tutorId) {
    where.tutorId = tutorId;
  }

  if (studentId) {
    where.studentId = studentId;
  }

  if (startDate || endDate) {
    where.slot = {};
    if (startDate) {
      where.slot.startTime = { gte: new Date(startDate as string) };
    }
    if (endDate) {
      where.slot.startTime = { ...where.slot.startTime, lte: new Date(endDate as string) };
    }
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

export const exportBookings = async (req: AuthRequest, res: Response) => {
  const { status, startDate, endDate } = req.query;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.slot = {};
    if (startDate) {
      where.slot.startTime = { gte: new Date(startDate as string) };
    }
    if (endDate) {
      where.slot.startTime = { ...where.slot.startTime, lte: new Date(endDate as string) };
    }
  }

  const bookings = await prisma.booking.findMany({
    where,
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
            },
          },
        },
      },
    },
  });

  const csvData = bookings.map((b: any) => ({
    id: b.id,
    student: `${b.student.firstName} ${b.student.lastName}`,
    studentEmail: b.student.email,
    tutor: `${b.tutor.user.firstName} ${b.tutor.user.lastName}`,
    subject: b.subject,
    startTime: b.slot.startTime.toISOString(),
    endTime: b.slot.endTime.toISOString(),
    status: b.status,
    createdAt: b.createdAt.toISOString(),
  }));

  const filePath = path.join(__dirname, '../../temp', `bookings-${Date.now()}.csv`);
  
  // Ensure temp directory exists
  const tempDir = path.dirname(filePath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'student', title: 'Student' },
      { id: 'studentEmail', title: 'Student Email' },
      { id: 'tutor', title: 'Tutor' },
      { id: 'subject', title: 'Subject' },
      { id: 'startTime', title: 'Start Time' },
      { id: 'endTime', title: 'End Time' },
      { id: 'status', title: 'Status' },
      { id: 'createdAt', title: 'Created At' },
    ],
  });

  await csvWriter.writeRecords(csvData);

  res.download(filePath, 'bookings.csv', (err) => {
    if (err) {
      console.error('Error downloading file:', err);
    }
    // Clean up file after download
    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
    });
  });
};

export const getStatistics = async (_req: AuthRequest, res: Response) => {
  const [
    totalUsers,
    totalStudents,
    totalTutors,
    totalBookings,
    confirmedBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'TUTOR' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      users: {
        total: totalUsers,
        students: totalStudents,
        tutors: totalTutors,
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        cancelled: totalBookings - confirmedBookings,
      },
      revenue: {
        total: 0, // Would calculate based on actual booking costs
      },
    },
  });
};
