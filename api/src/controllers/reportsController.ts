import { Request, Response, NextFunction } from 'express';
import { reportService } from '@/services/reportService';
import { logger } from '@/utils/logger';

export const reportsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const result = await reportService.getAll(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { uuid } = req.params;
      const report = await reportService.getById(uuid);

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json(report);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const result = await reportService.create({
        ...data,
        ipAddress,
        userAgent,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { uuid } = req.params;
      const deleteToken = req.get('X-Delete-Token');

      if (!deleteToken) {
        return res.status(400).json({ error: 'Delete token required in X-Delete-Token header' });
      }

      await reportService.delete(uuid, deleteToken);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
