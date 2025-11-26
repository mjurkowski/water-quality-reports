import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/authService';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const adminAuthController = {
  /**
   * POST /api/admin/auth/login
   * Login admin user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = loginSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.format(),
        });
        return;
      }

      const { email, password } = validation.data;

      const result = await authService.login(email, password);

      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid credentials' || error.message === 'Account is inactive') {
          res.status(401).json({ error: error.message });
          return;
        }
      }
      next(error);
    }
  },

  /**
   * GET /api/admin/auth/me
   * Get current admin user info
   */
  async getCurrentAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const adminUser = await authService.getAdminById(req.admin.id);

      res.json(adminUser);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/admin/auth/change-password
   * Change admin password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.admin) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      const validation = changePasswordSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: validation.error.format(),
        });
        return;
      }

      const { oldPassword, newPassword } = validation.data;

      await authService.changePassword(req.admin.id, oldPassword, newPassword);

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid old password') {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  },
};
