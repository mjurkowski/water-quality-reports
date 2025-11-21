import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // CORS
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174'],
  websiteUrl: process.env.WEBSITE_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5174',

  // File upload
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  maxPhotos: parseInt(process.env.MAX_PHOTOS || '5', 10),

  // Rate limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),

  // Geocoding (OpenStreetMap Nominatim)
  nominatimUrl: process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org',
  nominatimEmail: process.env.NOMINATIM_EMAIL || 'dev@example.com',

  // Security
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  recaptchaSecret: process.env.RECAPTCHA_SECRET_KEY,
};
