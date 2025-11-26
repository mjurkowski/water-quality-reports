import { Router } from 'express';
import { reportsController } from '@/controllers/reportsController';
import { authenticateAdmin } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';
import { createReportSchema, reportFiltersSchema } from '@/utils/validation';

const router = Router();

// All admin routes require authentication
router.use(authenticateAdmin);

/**
 * @openapi
 * /admin/reports:
 *   get:
 *     summary: List all reports (admin)
 *     description: Get all reports including deleted/spam for admin panel
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, deleted, spam]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of reports
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportsListResponse'
 *       401:
 *         description: Not authenticated
 */
router.get('/', validateRequest(reportFiltersSchema, 'query'), reportsController.getAllAdmin);

/**
 * @openapi
 * /admin/reports/{uuid}:
 *   get:
 *     summary: Get report by UUID (admin)
 *     description: Get report details including deleted/spam reports
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Not authenticated
 */
router.get('/:uuid', reportsController.getByIdAdmin);

/**
 * @openapi
 * /admin/reports/{uuid}/status:
 *   patch:
 *     summary: Update report status
 *     description: Change report status (active/deleted/spam)
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Report UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, deleted, spam]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Report not found
 *       401:
 *         description: Not authenticated
 */
router.patch('/:uuid/status', reportsController.updateStatus);

/**
 * @openapi
 * /admin/reports/{uuid}:
 *   delete:
 *     summary: Permanently delete report (admin)
 *     description: Hard delete a report and all associated photos
 *     tags: [Admin - Reports]
 *     security:
 *       - bearerAuth: []
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
 *         description: Report permanently deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Report not found
 *       401:
 *         description: Not authenticated
 */
router.delete('/:uuid', reportsController.deleteAdmin);

export default router;
