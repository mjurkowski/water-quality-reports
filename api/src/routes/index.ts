import { Router } from 'express';
import reportsRouter from './reports';
import statsRouter from './stats';
import geocodeRouter from './geocode';
import healthRouter from './health';
import adminAuthRouter from './adminAuth';
import adminReportsRouter from './adminReports';

const router = Router();

router.use('/reports', reportsRouter);
router.use('/stats', statsRouter);
router.use('/geocode', geocodeRouter);
router.use('/health', healthRouter);
router.use('/admin/auth', adminAuthRouter);
router.use('/admin/reports', adminReportsRouter);

export default router;
