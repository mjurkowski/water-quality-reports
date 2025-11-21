import request from 'supertest';
import express from 'express';
import statsRouter from '@/routes/stats';
import { errorHandler } from '@/middleware/errorHandler';

// Mock Prisma client
jest.mock('@/db/client', () => ({
  prisma: {
    report: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

import { prisma } from '@/db/client';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Stats API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/stats', statsRouter);
    app.use(errorHandler);
    jest.clearAllMocks();

    // Default mock implementations
    (mockPrisma.report.count as jest.Mock).mockResolvedValue(25);
    (mockPrisma.report.findMany as jest.Mock).mockResolvedValue([
      { types: ['brown_water', 'bad_smell'] },
      { types: ['brown_water'] },
      { types: ['sediment'] },
      { types: ['pressure'] },
    ]);
    (mockPrisma.report.groupBy as jest.Mock)
      .mockResolvedValueOnce([
        { city: 'Warszawa', _count: 10 },
        { city: 'Kraków', _count: 8 },
        { city: 'Wrocław', _count: 5 },
      ])
      .mockResolvedValueOnce([
        { voivodeship: 'mazowieckie', _count: 12 },
        { voivodeship: 'małopolskie', _count: 8 },
      ]);
  });

  describe('GET /api/stats', () => {
    it('should return stats with default period', async () => {
      const response = await request(app).get('/api/stats');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('period', 'month');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('recentCount');
      expect(response.body).toHaveProperty('byType');
      expect(response.body).toHaveProperty('byCity');
      expect(response.body).toHaveProperty('byVoivodeship');
    });

    it('should accept week period', async () => {
      const response = await request(app)
        .get('/api/stats')
        .query({ period: 'week' });

      expect(response.status).toBe(200);
      expect(response.body.period).toBe('week');
    });

    it('should accept month period', async () => {
      const response = await request(app)
        .get('/api/stats')
        .query({ period: 'month' });

      expect(response.status).toBe(200);
      expect(response.body.period).toBe('month');
    });

    it('should accept year period', async () => {
      const response = await request(app)
        .get('/api/stats')
        .query({ period: 'year' });

      expect(response.status).toBe(200);
      expect(response.body.period).toBe('year');
    });

    it('should accept all period', async () => {
      const response = await request(app)
        .get('/api/stats')
        .query({ period: 'all' });

      expect(response.status).toBe(200);
      expect(response.body.period).toBe('all');
    });

    it('should reject invalid period', async () => {
      const response = await request(app)
        .get('/api/stats')
        .query({ period: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should return byType counts', async () => {
      const response = await request(app).get('/api/stats');

      expect(response.body.byType).toEqual({
        brown_water: 2,
        bad_smell: 1,
        sediment: 1,
        pressure: 1,
      });
    });

    it('should return byCity array', async () => {
      const response = await request(app).get('/api/stats');

      expect(Array.isArray(response.body.byCity)).toBe(true);
      expect(response.body.byCity[0]).toHaveProperty('city');
      expect(response.body.byCity[0]).toHaveProperty('count');
    });

    it('should return byVoivodeship array', async () => {
      const response = await request(app).get('/api/stats');

      expect(Array.isArray(response.body.byVoivodeship)).toBe(true);
      expect(response.body.byVoivodeship[0]).toHaveProperty('voivodeship');
      expect(response.body.byVoivodeship[0]).toHaveProperty('count');
    });
  });
});
