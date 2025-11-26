import { Router } from 'express';
import { adminAuthController } from '@/controllers/adminAuthController';
import { authenticateAdmin } from '@/middleware/auth';

const router = Router();

/**
 * @openapi
 * /admin/auth/login:
 *   post:
 *     tags:
 *       - Admin Auth
 *     summary: Admin login
 *     description: Authenticate admin user and receive JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Invalid credentials or inactive account
 *       400:
 *         description: Validation error
 */
router.post('/login', adminAuthController.login);

/**
 * @openapi
 * /admin/auth/me:
 *   get:
 *     tags:
 *       - Admin Auth
 *     summary: Get current admin user
 *     description: Get information about the currently authenticated admin user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 role:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                 lastLoginAt:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Not authenticated
 */
router.get('/me', authenticateAdmin, adminAuthController.getCurrentAdmin);

/**
 * @openapi
 * /admin/auth/change-password:
 *   post:
 *     tags:
 *       - Admin Auth
 *     summary: Change admin password
 *     description: Change the password for the currently authenticated admin user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error or invalid old password
 *       401:
 *         description: Not authenticated
 */
router.post('/change-password', authenticateAdmin, adminAuthController.changePassword);

export default router;
