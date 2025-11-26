import { Router } from 'express';
import { statsController } from '@/controllers/statsController';
import { validateRequest } from '@/middleware/validation';
import { statsQuerySchema } from '@/utils/validation';

const router = Router();

/**
 * @openapi
 * /stats:
 *   get:
 *     summary: Get statistics
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *           default: month
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Statistics data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stats'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validateRequest(statsQuerySchema, 'query'), statsController.getStats);

export default router;
