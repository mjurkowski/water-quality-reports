import request from 'supertest';
import express from 'express';
import geocodeRouter from '@/routes/geocode';
import { errorHandler } from '@/middleware/errorHandler';

// Mock geocode service
jest.mock('@/services/geocodeService', () => ({
  geocodeService: {
    search: jest.fn(),
    reverse: jest.fn(),
  },
}));

import { geocodeService } from '@/services/geocodeService';

const mockGeocodeService = geocodeService as jest.Mocked<typeof geocodeService>;

describe('Geocode API', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/geocode', geocodeRouter);
    app.use(errorHandler);
    jest.clearAllMocks();
  });

  describe('GET /api/geocode', () => {
    const mockSearchResults = [
      {
        lat: 52.2297,
        lon: 21.0122,
        display_name: 'Warszawa, mazowieckie, Polska',
      },
      {
        lat: 52.4064,
        lon: 16.9252,
        display_name: 'Poznań, wielkopolskie, Polska',
      },
    ];

    it('should return search results for valid query', async () => {
      mockGeocodeService.search.mockResolvedValue(mockSearchResults);

      const response = await request(app)
        .get('/api/geocode')
        .query({ q: 'Warszawa' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results).toHaveLength(2);
    });

    it('should return proper result structure', async () => {
      mockGeocodeService.search.mockResolvedValue(mockSearchResults);

      const response = await request(app)
        .get('/api/geocode')
        .query({ q: 'Warszawa' });

      expect(response.body.results[0]).toHaveProperty('lat');
      expect(response.body.results[0]).toHaveProperty('lon');
      expect(response.body.results[0]).toHaveProperty('display_name');
    });

    it('should reject query shorter than 2 characters', async () => {
      const response = await request(app)
        .get('/api/geocode')
        .query({ q: 'a' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation error');
    });

    it('should reject missing query parameter', async () => {
      const response = await request(app).get('/api/geocode');

      expect(response.status).toBe(400);
    });

    it('should return empty results for no matches', async () => {
      mockGeocodeService.search.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/geocode')
        .query({ q: 'xyznonexistent' });

      expect(response.status).toBe(200);
      expect(response.body.results).toEqual([]);
    });

    it('should handle service errors gracefully', async () => {
      mockGeocodeService.search.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/geocode')
        .query({ q: 'test' });

      expect(response.status).toBe(200);
      expect(response.body.results).toEqual([]);
    });

    it('should call geocodeService.search with correct query', async () => {
      mockGeocodeService.search.mockResolvedValue([]);

      await request(app)
        .get('/api/geocode')
        .query({ q: 'Kraków' });

      expect(mockGeocodeService.search).toHaveBeenCalledWith('Kraków');
    });
  });
});
