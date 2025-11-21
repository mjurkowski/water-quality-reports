import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error:', err);

  // Known errors
  if (err.message === 'Report not found') {
    return res.status(404).json({ error: err.message });
  }

  if (err.message === 'Invalid delete token') {
    return res.status(403).json({ error: err.message });
  }

  if (err.message === 'Delete period expired (24 hours)') {
    return res.status(410).json({ error: err.message });
  }

  if (err.message.includes('Maximum') || err.message.includes('Invalid')) {
    return res.status(400).json({ error: err.message });
  }

  // Generic error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}
