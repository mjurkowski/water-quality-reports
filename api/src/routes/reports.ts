import { Router } from 'express';
import { reportsController } from '@/controllers/reportsController';
import { rateLimitMiddleware } from '@/middleware/rateLimit';
import { validateRequest } from '@/middleware/validation';
import { createReportSchema, reportFiltersSchema } from '@/utils/validation';

const router = Router();

router.get('/', validateRequest(reportFiltersSchema, 'query'), reportsController.getAll);
router.get('/:uuid', reportsController.getById);
router.post('/', rateLimitMiddleware, validateRequest(createReportSchema), reportsController.create);
router.delete('/:uuid', reportsController.delete);

export default router;
