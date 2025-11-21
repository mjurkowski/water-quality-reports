import { Router } from 'express';
import { statsController } from '@/controllers/statsController';
import { validateRequest } from '@/middleware/validation';
import { statsQuerySchema } from '@/utils/validation';

const router = Router();

router.get('/', validateRequest(statsQuerySchema, 'query'), statsController.getStats);

export default router;
