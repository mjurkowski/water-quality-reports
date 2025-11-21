import { jest } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
process.env.NOMINATIM_EMAIL = 'test@example.com';
process.env.UPLOAD_DIR = './test-uploads';
process.env.MAX_FILE_SIZE = '5242880';
process.env.MAX_PHOTOS = '5';
process.env.RATE_LIMIT_WINDOW = '60000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Cleanup code if needed
});
