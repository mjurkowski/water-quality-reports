import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@/db/client';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

export interface AdminPayload {
  id: number;
  email: string;
  role: string;
}

export const authService = {
  /**
   * Create a new admin user
   */
  async createAdminUser(email: string, password: string, name?: string, role: string = 'admin') {
    const existingUser = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Admin user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const adminUser = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        isActive: true,
      },
    });

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      isActive: adminUser.isActive,
      createdAt: adminUser.createdAt,
    };
  },

  /**
   * Authenticate admin user and return JWT token
   */
  async login(email: string, password: string) {
    const adminUser = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!adminUser) {
      throw new Error('Invalid credentials');
    }

    if (!adminUser.isActive) {
      throw new Error('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login timestamp
    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: AdminPayload = {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
      token,
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    };
  },

  /**
   * Verify JWT token and return payload
   */
  verifyToken(token: string): AdminPayload {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as AdminPayload;
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },

  /**
   * Get admin user by ID
   */
  async getAdminById(id: number) {
    const adminUser = await prisma.adminUser.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    if (!adminUser.isActive) {
      throw new Error('Account is inactive');
    }

    return adminUser;
  },

  /**
   * Change admin password
   */
  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const adminUser = await prisma.adminUser.findUnique({
      where: { id },
    });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, adminUser.passwordHash);

    if (!isPasswordValid) {
      throw new Error('Invalid old password');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });

    return { success: true };
  },
};
