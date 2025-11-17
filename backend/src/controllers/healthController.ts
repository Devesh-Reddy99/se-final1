import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import os from 'os';

const prisma = new PrismaClient();

export const healthCheck = async (_req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'success',
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Server is unhealthy',
      database: 'disconnected',
    });
  }
};

export const getMetrics = async (_req: Request, res: Response) => {
  const [
    totalUsers,
    totalBookings,
    activeSlots,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.slot.count({ where: { isBooked: false, startTime: { gte: new Date() } } }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      system: {
        uptime: process.uptime(),
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
        },
        platform: os.platform(),
        nodeVersion: process.version,
      },
      application: {
        users: totalUsers,
        bookings: totalBookings,
        availableSlots: activeSlots,
      },
    },
  });
};
