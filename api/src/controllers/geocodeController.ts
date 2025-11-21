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
};
