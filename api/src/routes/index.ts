import { Router } from 'express';
import reportsRouter from './reports';
import statsRouter from './stats';
import geocodeRouter from './geocode';
import healthRouter from './health';

const router = Router();

router.use('/reports', reportsRouter);
router.use('/stats', statsRouter);
router.use('/geocode', geocodeRouter);
router.use('/health', healthRouter);

export default router;
