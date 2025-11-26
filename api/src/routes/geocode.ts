import { Router } from 'express';
import { geocodeController } from '@/controllers/geocodeController';
import { validateRequest } from '@/middleware/validation';
import { geocodeSearchSchema } from '@/utils/validation';

const router = Router();

/**
 * @openapi
 * /geocode:
 *   get:
 *     summary: Search for addresses (geocoding)
 *     tags: [Geocode]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (address, city, etc.)
 *     responses:
 *       200:
 *         description: Geocoding results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeocodeResponse'
 *       400:
 *         description: Validation error (query too short)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validateRequest(geocodeSearchSchema, 'query'), geocodeController.search);

/**
 * @openapi
 * /geocode/reverse:
 *   get:
 *     summary: Reverse geocode coordinates to address
 *     tags: [Geocode]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude
 *     responses:
 *       200:
 *         description: Reverse geocoding result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReverseGeocodeResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/reverse', geocodeController.reverse);

export default router;
