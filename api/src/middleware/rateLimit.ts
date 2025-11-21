import rateLimit from 'express-rate-limit';
import { config } from '@/config/app';

export const rateLimitMiddleware = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
