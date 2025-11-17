import { Router } from 'express';
import { createSlot, getSlots, updateSlot, deleteSlot } from '../controllers/slotController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { createSlotValidation } from '../middlewares/validation.middleware';

const router = Router();

/**
 * @swagger
 * /api/slots:
 *   get:
 *     tags: [Slots]
 *     summary: Get available slots
 *     parameters:
 *       - in: query
 *         name: tutorId
 *         schema:
 *           type: string
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of slots
 */
router.get('/', authenticate, getSlots);

/**
 * @swagger
 * /api/slots:
 *   post:
 *     tags: [Slots]
 *     summary: Create time slot
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: number
 *               recurrence:
 *                 type: string
 *                 enum: [NONE, DAILY, WEEKLY, MONTHLY]
 *     responses:
 *       201:
 *         description: Slot created
 */
router.post('/', authenticate, authorize('TUTOR'), createSlotValidation, createSlot);

/**
 * @swagger
 * /api/slots/{id}:
 *   put:
 *     tags: [Slots]
 *     summary: Update slot
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
 *         description: Slot updated
 */
router.put('/:id', authenticate, authorize('TUTOR'), updateSlot);

/**
 * @swagger
 * /api/slots/{id}:
 *   delete:
 *     tags: [Slots]
 *     summary: Delete slot
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
 *         description: Slot deleted
 */
router.delete('/:id', authenticate, authorize('TUTOR'), deleteSlot);

export default router;
