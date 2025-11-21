import request from 'supertest';
import express from 'express';
import reportsRouter from '@/routes/reports';
import { errorHandler } from '@/middleware/errorHandler';

// Mock dependencies
jest.mock('@/db/client', () => ({
  prisma: {
    report: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/services/geocodeService', () => ({
  geocodeService: {
    reverse: jest.fn().mockResolvedValue({
      address: 'ul. Testowa 1, Warszawa',
      city: 'Warszawa',
      voivodeship: 'mazowieckie',
      postalCode: '00-001',
    }),
  },
}));

jest.mock('@/utils/photo', () => ({
  savePhoto: jest.fn().mockResolvedValue({
    url: '/uploads/test-photo.jpg',
    filename: 'test-photo.jpg',
    size: 1024,
  }),
}));

import { prisma } from '@/db/client';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Reports API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/reports', reportsRouter);
    app.use(errorHandler);
    jest.clearAllMocks();
  });

  describe('GET /api/reports', () => {
    const mockReports = [
      {
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        types: ['brown_water'],
        description: 'Test report',
        latitude: 52.2297,
        longitude: 21.0122,
        address: 'ul. Testowa 1',
        city: 'Warszawa',
        voivodeship: 'mazowieckie',
        reportedAt: new Date('2024-11-19T10:00:00Z'),
        createdAt: new Date('2024-11-19T10:00:00Z'),
        photos: [],
      },
    ];

    it('should return list of reports', async () => {
      (mockPrisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      const response = await request(app).get('/api/reports');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reports');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.reports)).toBe(true);
    });

    it('should filter by bounds', async () => {
      (mockPrisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      const response = await request(app)
        .get('/api/reports')
        .query({ bounds: '50.0,19.0,53.0,22.0' });

      expect(response.status).toBe(200);
      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.any(Array),
          }),
        })
      );
    });

    it('should filter by type', async () => {
      (mockPrisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      const response = await request(app)
        .get('/api/reports')
        .query({ type: 'brown_water' });

      expect(response.status).toBe(200);
      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            types: { hasSome: ['brown_water'] },
          }),
        })
      );
    });

    it('should filter by city', async () => {
      (mockPrisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      const response = await request(app)
        .get('/api/reports')
        .query({ city: 'Warszawa' });

      expect(response.status).toBe(200);
      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            city: 'Warszawa',
          }),
        })
      );
    });

    it('should respect limit parameter', async () => {
      (mockPrisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      await request(app)
        .get('/api/reports')
        .query({ limit: '50' });

      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        })
      );
    });

    it('should cap limit at 1000', async () => {
      (mockPrisma.report.findMany as jest.Mock).mockResolvedValue(mockReports);

      await request(app)
        .get('/api/reports')
        .query({ limit: '5000' });

      expect(mockPrisma.report.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1000,
        })
      );
    });
  });

  describe('GET /api/reports/:uuid', () => {
    const mockReport = {
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      types: ['brown_water'],
      description: 'Test report',
      latitude: 52.2297,
      longitude: 21.0122,
      address: 'ul. Testowa 1',
      city: 'Warszawa',
      voivodeship: 'mazowieckie',
      postalCode: '00-001',
      reportedAt: new Date('2024-11-19T10:00:00Z'),
      createdAt: new Date('2024-11-19T10:00:00Z'),
      photos: [],
    };

    it('should return report by uuid', async () => {
      (mockPrisma.report.findUnique as jest.Mock).mockResolvedValue(mockReport);

      const response = await request(app)
        .get('/api/reports/550e8400-e29b-41d4-a716-446655440000');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uuid', mockReport.uuid);
      expect(response.body).toHaveProperty('types');
      expect(response.body).toHaveProperty('latitude');
    });

    it('should return 404 for non-existent report', async () => {
      (mockPrisma.report.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/reports/550e8400-e29b-41d4-a716-446655440001');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Report not found');
    });
  });

  describe('POST /api/reports', () => {
    const validReportData = {
      types: ['brown_water'],
      latitude: 52.2297,
      longitude: 21.0122,
      reportedAt: '2024-11-19T10:00:00.000Z',
    };

    const mockCreatedReport = {
      id: 1,
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      ...validReportData,
      deleteToken: '123e4567-e89b-12d3-a456-426614174000',
      photos: [],
    };

    it('should create a new report', async () => {
      (mockPrisma.report.create as jest.Mock).mockResolvedValue(mockCreatedReport);

      const response = await request(app)
        .post('/api/reports')
        .send(validReportData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('uuid');
      expect(response.body).toHaveProperty('deleteToken');
      expect(response.body).toHaveProperty('message', 'Report created successfully');
    });

    it('should reject report without types', async () => {
      const { types, ...invalidData } = validReportData;

      const response = await request(app)
        .post('/api/reports')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should reject report with empty types array', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({ ...validReportData, types: [] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should reject report with invalid latitude', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({ ...validReportData, latitude: 91 });

      expect(response.status).toBe(400);
    });

    it('should accept report with optional fields', async () => {
      (mockPrisma.report.create as jest.Mock).mockResolvedValue(mockCreatedReport);

      const response = await request(app)
        .post('/api/reports')
        .send({
          ...validReportData,
          description: 'Test description',
          address: 'ul. Testowa 1, Warszawa',
          contactEmail: 'test@example.com',
        });

      expect(response.status).toBe(201);
    });
  });

  describe('DELETE /api/reports/:uuid', () => {
    const mockReport = {
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      deleteToken: '123e4567-e89b-12d3-a456-426614174000',
      createdAt: new Date(), // Within 24 hours
    };

    it('should delete report with valid token', async () => {
      (mockPrisma.report.findUnique as jest.Mock).mockResolvedValue(mockReport);
      (mockPrisma.report.update as jest.Mock).mockResolvedValue({ ...mockReport, status: 'deleted' });

      const response = await request(app)
        .delete('/api/reports/550e8400-e29b-41d4-a716-446655440000')
        .set('X-Delete-Token', mockReport.deleteToken);

      expect(response.status).toBe(204);
    });

    it('should reject deletion without token', async () => {
      const response = await request(app)
        .delete('/api/reports/550e8400-e29b-41d4-a716-446655440000');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject deletion with invalid token', async () => {
      (mockPrisma.report.findUnique as jest.Mock).mockResolvedValue(mockReport);

      const response = await request(app)
        .delete('/api/reports/550e8400-e29b-41d4-a716-446655440000')
        .set('X-Delete-Token', 'invalid-token');

      expect(response.status).toBe(403);
    });

    it('should reject deletion after 24 hours', async () => {
      const oldReport = {
        ...mockReport,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
      };
      (mockPrisma.report.findUnique as jest.Mock).mockResolvedValue(oldReport);

      const response = await request(app)
        .delete('/api/reports/550e8400-e29b-41d4-a716-446655440000')
        .set('X-Delete-Token', mockReport.deleteToken);

      expect(response.status).toBe(410);
    });

    it('should return 404 for non-existent report', async () => {
      (mockPrisma.report.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/reports/550e8400-e29b-41d4-a716-446655440001')
        .set('X-Delete-Token', 'some-token');

      expect(response.status).toBe(404);
    });
  });
});
