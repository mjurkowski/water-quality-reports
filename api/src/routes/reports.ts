import { Router } from 'express';
import { reportsController } from '@/controllers/reportsController';
import { rateLimitMiddleware } from '@/middleware/rateLimit';
import { validateRequest } from '@/middleware/validation';
import { createReportSchema, reportFiltersSchema } from '@/utils/validation';

const router = Router();

/**
 * @openapi
 * /reports:
 *   get:
 *     summary: List all reports
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Number of reports to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of reports to skip
 *       - in: query
 *         name: types
 *         schema:
 *           type: string
 *         description: Comma-separated list of report types
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: north
 *         schema:
 *           type: number
 *         description: North boundary for map filtering
 *       - in: query
 *         name: south
 *         schema:
 *           type: number
 *         description: South boundary for map filtering
 *       - in: query
 *         name: east
 *         schema:
 *           type: number
 *         description: East boundary for map filtering
 *       - in: query
 *         name: west
 *         schema:
 *           type: number
 *         description: West boundary for map filtering
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportsListResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validateRequest(reportFiltersSchema, 'query'), reportsController.getAll);

/**
 * @openapi
 * /reports/{uuid}:
 *   get:
 *     summary: Get report by UUID
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report UUID
 *     responses:
 *       200:
 *         description: Report details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:uuid', reportsController.getById);

/**
 * @openapi
 * /reports:
 *   post:
 *     summary: Create a new report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReportRequest'
 *     responses:
 *       201:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateReportResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', rateLimitMiddleware, validateRequest(createReportSchema), reportsController.create);

/**
 * @openapi
 * /reports/{uuid}:
 *   delete:
 *     summary: Delete a report
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report UUID
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Delete token received when creating the report
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Invalid delete token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Report not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       410:
 *         description: Delete period expired (24 hours)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:uuid', reportsController.delete);

export default router;
