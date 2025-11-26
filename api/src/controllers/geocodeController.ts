import { Request, Response, NextFunction } from 'express';
import { geocodeService } from '@/services/geocodeService';

export const geocodeController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
      }

      const results = await geocodeService.search(q);
      res.json({ results });
    } catch (error) {
      next(error);
    }
  },

  async reverse(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lon } = req.query;

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ error: 'Valid "lat" and "lon" parameters are required' });
      }

      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({ error: 'Latitude must be between -90 and 90' });
      }

      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: 'Longitude must be between -180 and 180' });
      }

      const result = await geocodeService.reverse(latitude, longitude);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
