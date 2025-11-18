import { Router } from 'express';
import { createTutor, getTutors, getTutorById, updateTutor, getMyProfile, updateMyProfile } from '../controllers/tutorController';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';
import { createTutorValidation } from '../middlewares/validation.middleware';

const router = Router();

/**
 * @swagger
 * /api/tutors/profile:
 *   get:
 *     tags: [Tutors]
 *     summary: Get current user's tutor profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tutor profile
 */
router.get('/profile', authenticate, authorize('TUTOR'), getMyProfile);

/**
 * @swagger
 * /api/tutors/profile:
 *   put:
 *     tags: [Tutors]
 *     summary: Update current user's tutor profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tutor profile updated
 */
router.put('/profile', authenticate, authorize('TUTOR'), updateMyProfile);

/**
 * @swagger
 * /api/tutors:
 *   get:
 *     tags: [Tutors]
 *     summary: Search and get all tutors
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: minRate
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxRate
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of tutors
 */
router.get('/', getTutors);

/**
 * @swagger
 * /api/tutors/{id}:
 *   get:
 *     tags: [Tutors]
 *     summary: Get tutor by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tutor details
 */
router.get('/:id', getTutorById);

/**
 * @swagger
 * /api/tutors:
 *   post:
 *     tags: [Tutors]
 *     summary: Create tutor profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *               hourlyRate:
 *                 type: number
 *               experience:
 *                 type: number
 *               education:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tutor profile created
 */
router.post('/', authenticate, authorize('TUTOR'), createTutorValidation, createTutor);

/**
 * @swagger
 * /api/tutors/{id}:
 *   put:
 *     tags: [Tutors]
 *     summary: Update tutor profile
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
 *         description: Tutor profile updated
 */
router.put('/:id', authenticate, authorize('TUTOR'), updateTutor);

export default router;
