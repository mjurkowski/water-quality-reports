import { jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
export const mockPrisma = {
  report: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  photo: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  $queryRaw: jest.fn(),
  $disconnect: jest.fn(),
} as unknown as jest.Mocked<PrismaClient>;

// Reset all mocks before each test
export const resetPrismaMocks = () => {
  Object.values(mockPrisma.report).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as jest.Mock).mockReset();
    }
  });
  Object.values(mockPrisma.photo).forEach(mock => {
    if (typeof mock === 'function' && 'mockReset' in mock) {
      (mock as jest.Mock).mockReset();
    }
  });
};
