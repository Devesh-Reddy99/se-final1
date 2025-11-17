import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendBookingReminder } from '../services/emailService';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export const startReminderScheduler = () => {
  // Run every 5 minutes
  cron.schedule(process.env.REMINDER_CRON_SCHEDULE || '*/5 * * * *', async () => {
    try {
      logger.info('Running reminder job...');

      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

      // Find bookings that start in approximately 1 hour and haven't received reminders
      const bookings = await prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          reminderSent: false,
          slot: {
            startTime: {
              gte: now,
              lte: oneHourLater,
            },
          },
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

      logger.info(`Found ${bookings.length} bookings to send reminders for`);

      for (const booking of bookings) {
        try {
          await sendBookingReminder(booking);

          // Mark as reminder sent
          await prisma.booking.update({
            where: { id: booking.id },
            data: { reminderSent: true },
          });

          logger.info(`Reminder sent for booking ${booking.id}`);
        } catch (error) {
          logger.error(`Failed to send reminder for booking ${booking.id}:`, error);
        }
      }

      logger.info('Reminder job completed');
    } catch (error) {
      logger.error('Error in reminder job:', error);
    }
  });

  logger.info('Reminder scheduler started');
};
