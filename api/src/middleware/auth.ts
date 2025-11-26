import { Request, Response, NextFunction } from 'express';
import { authService, AdminPayload } from '@/services/authService';

// Extend Express Request type to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

/**
 * Middleware to authenticate admin requests using JWT
 */
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const payload = authService.verifyToken(token);

      // Verify admin user still exists and is active
      const adminUser = await authService.getAdminById(payload.id);

      if (!adminUser) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      // Attach admin payload to request
      req.admin = payload;

      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if admin has specific role
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
