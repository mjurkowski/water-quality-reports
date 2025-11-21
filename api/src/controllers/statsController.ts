import { Request, Response, NextFunction } from 'express';
import { statsService } from '@/services/statsService';

export const statsController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { period } = req.query;
      const result = await statsService.getStats(period as 'week' | 'month' | 'year' | 'all');
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
