import request from 'supertest';
import express from 'express';
import healthRouter from '@/routes/health';

// Mock Prisma client
jest.mock('@/db/client', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

import { prisma } from '@/db/client';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Health API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/api/health', healthRouter);
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return healthy status when database is connected', async () => {
      (mockPrisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'healthy',
        database: 'connected',
      });
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return unhealthy status when database is disconnected', async () => {
      (mockPrisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Connection refused'));

      const response = await request(app).get('/api/health');

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        status: 'unhealthy',
        database: 'disconnected',
      });
      expect(response.body.error).toBeDefined();
    });
  });
});
