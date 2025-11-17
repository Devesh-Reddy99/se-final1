import { Router } from 'express';
import { createBooking, getBookings, cancelBooking } from '../controllers/bookingController';
import { authenticate } from '../middlewares/auth.middleware';
import { createBookingValidation } from '../middlewares/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Get user bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/', getBookings);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a new booking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slotId:
 *                 type: string
 *               subject:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created
 */
router.post('/', createBookingValidation, createBooking);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     tags: [Bookings]
 *     summary: Cancel a booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking cancelled
 */
router.put('/:id/cancel', cancelBooking);

export default router;
