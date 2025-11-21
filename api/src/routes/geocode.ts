import { Router } from 'express';
import { geocodeController } from '@/controllers/geocodeController';
import { validateRequest } from '@/middleware/validation';
import { geocodeSearchSchema } from '@/utils/validation';

const router = Router();

router.get('/', validateRequest(geocodeSearchSchema, 'query'), geocodeController.search);

export default router;
