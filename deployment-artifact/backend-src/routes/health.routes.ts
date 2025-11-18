import { Router } from 'express';
import { healthCheck, getMetrics } from '../controllers/healthController';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/health', healthCheck);

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     tags: [Health]
 *     summary: Get system metrics
 *     responses:
 *       200:
 *         description: System metrics
 */
router.get('/metrics', getMetrics);

export default router;
