# Implementacja Backendu - Express.js API

## 1. Przegląd

### 1.1. Stack Technologiczny Backend
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js
- **Database**: PostgreSQL 16 + PostGIS
- **ORM**: Prisma
- **Validation**: Zod
- **File Upload**: Multer
- **Security**: helmet, cors, express-rate-limit
- **Process Manager**: PM2 (production)

### 1.2. Architektura Backend

```
Backend Architecture:
├── REST API (Express routes)
│   ├── /api/reports (CRUD)
│   ├── /api/stats (Analytics)
│   ├── /api/geocode (Geocoding)
│   └── /api/health (Health check)
├── Database Layer (Prisma)
├── Business Logic (Services)
├── Middleware (Auth, Rate limit, Validation)
└── Static Files (Frontend dist)
```

## 2. Etapy Implementacji

### Etap 1: Setup Projektu (Tydzień 1) ⏱️ ~4-6h

#### 1.1. Inicjalizacja Projektu

```bash
# Utwórz backend folder
mkdir backend
cd backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express
npm install @prisma/client
npm install zod
npm install cors helmet express-rate-limit
npm install multer
npm install dotenv
npm install compression

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/multer @types/compression
npm install -D tsx
npm install -D prisma
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D jest @types/jest ts-jest supertest @types/supertest
npm install -D pm2
```

#### 1.2. TypeScript Configuration

**Plik: `tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node", "jest"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*", "prisma/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### 1.3. Package.json Scripts

**Plik: `package.json`**
```json
{
  "name": "water-reports-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:pm2": "pm2 start ecosystem.config.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### Etap 2: Database Setup (Tydzień 1) ⏱️ ~4-6h

#### 2.1. Prisma Schema

**Plik: `prisma/schema.prisma`**
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

model Report {
  id           Int      @id @default(autoincrement())
  uuid         String   @unique @default(uuid())
  types        String[] // Array of problem types (multiple selection)
  description  String?  @db.Text
  latitude     Float
  longitude    Float
  address      String?  @db.VarChar(500)
  city         String?  @db.VarChar(100)
  voivodeship  String?  @db.VarChar(50)
  postalCode   String?  @db.VarChar(10)
  contactEmail String?  @db.VarChar(255)
  reportedAt   DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  ipAddress    String?  @db.Inet
  userAgent    String?  @db.Text
  status       String   @default("active")
  deleteToken  String?  @unique

  // Relation to photos (one-to-many)
  photos       Photo[]

  @@index([types])
  @@index([reportedAt])
  @@index([createdAt])
  @@index([city])
  @@index([status])
}

model Photo {
  id        Int      @id @default(autoincrement())
  url       String   @db.VarChar(500)
  filename  String   @db.VarChar(255)
  size      Int      // File size in bytes
  mimeType  String   @db.VarChar(50)
  createdAt DateTime @default(now())

  // Foreign key to Report
  reportId  Int
  report    Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@index([reportId])
}
```

#### 2.2. Custom Migration for PostGIS

Po uruchomieniu `npx prisma migrate dev --name init`, edytuj plik migracji:

**Plik: `prisma/migrations/[timestamp]_init/migration.sql`**
```sql
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- (existing migration SQL here...)

-- Add geometry column
ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS location GEOMETRY(POINT, 4326);

-- Create spatial index
CREATE INDEX IF NOT EXISTS idx_reports_location ON "Report" USING GIST (location);

-- Create trigger to update location
CREATE OR REPLACE FUNCTION update_location()
RETURNS TRIGGER AS $$
BEGIN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location
    BEFORE INSERT OR UPDATE OF latitude, longitude
    ON "Report"
    FOR EACH ROW
    EXECUTE FUNCTION update_location();
```

#### 2.3. Database Client

**Plik: `src/db/client.ts`**
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

### Etap 3: Express App Setup (Tydzień 1-2) ⏱️ ~6-8h

#### 3.1. Express Application

**Plik: `src/app.ts`**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { config } from './config/app';
import { errorHandler } from './middleware/errorHandler';
import router from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// API routes
app.use('/api', router);

// Serve frontend static files (production)
if (config.nodeEnv === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

export default app;
```

#### 3.2. Server Entry Point

**Plik: `src/server.ts`**
```typescript
import app from './app';
import { config } from './config/app';
import { logger } from './utils/logger';

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${config.nodeEnv}`);
  logger.info(`🌐 CORS origin: ${config.corsOrigin}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});
```

#### 3.3. Configuration

**Plik: `src/config/app.ts`**
```typescript
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // File upload
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),

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
```

### Etap 4: Routes & Controllers (Tydzień 2) ⏱️ ~8-10h

#### 4.1. Routes Index

**Plik: `src/routes/index.ts`**
```typescript
import { Router } from 'express';
import reportsRouter from './reports';
import statsRouter from './stats';
import geocodeRouter from './geocode';
import healthRouter from './health';

const router = Router();

router.use('/reports', reportsRouter);
router.use('/stats', statsRouter);
router.use('/geocode', geocodeRouter);
router.use('/health', healthRouter);

export default router;
```

#### 4.2. Reports Routes

**Plik: `src/routes/reports.ts`**
```typescript
import { Router } from 'express';
import { reportsController } from '../controllers/reportsController';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { validateRequest } from '../middleware/validation';
import { createReportSchema, reportFiltersSchema } from '../utils/validation';

const router = Router();

router.get('/', validateRequest(reportFiltersSchema, 'query'), reportsController.getAll);
router.get('/:uuid', reportsController.getById);
router.post('/', rateLimitMiddleware, validateRequest(createReportSchema), reportsController.create);
router.delete('/:uuid', reportsController.delete);

export default router;
```

#### 4.3. Reports Controller

**Plik: `src/controllers/reportsController.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import { reportService } from '../services/reportService';
import { logger } from '../utils/logger';

export const reportsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = req.query;
      const result = await reportService.getAll(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { uuid } = req.params;
      const report = await reportService.getById(uuid);

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json(report);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.get('user-agent');

      const result = await reportService.create({
        ...data,
        ipAddress,
        userAgent,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { uuid } = req.params;
      const deleteToken = req.get('X-Delete-Token');

      if (!deleteToken) {
        return res.status(400).json({ error: 'Delete token required' });
      }

      await reportService.delete(uuid, deleteToken);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
```

### Etap 5: Services & Business Logic (Tydzień 2-3) ⏱️ ~8-10h

#### 5.1. Report Service

**Plik: `src/services/reportService.ts`**
```typescript
import { prisma } from '../db/client';
import { Prisma } from '@prisma/client';
import { savePhoto } from '../utils/photo';
import { geocodeService } from './geocodeService';

interface ReportFilters {
  bounds?: string;
  type?: string | string[];
  startDate?: string;
  endDate?: string;
  city?: string;
  limit?: string;
}

interface CreateReportData {
  types: string[]; // Array of problem types
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  photos?: Array<{
    base64: string;
    mimeType: string;
  }>; // Max 5 photos
  contactEmail?: string;
  reportedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

export const reportService = {
  async getAll(filters: ReportFilters) {
    const where: Prisma.ReportWhereInput = {
      status: 'active',
    };

    // Parse bounds
    if (filters.bounds) {
      const [minLat, minLng, maxLat, maxLng] = filters.bounds.split(',').map(Number);
      where.AND = [
        { latitude: { gte: minLat, lte: maxLat } },
        { longitude: { gte: minLng, lte: maxLng } },
      ];
    }

    // Filter by types (array overlap)
    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      where.types = { hasSome: types };
    }

    // Filter by date range
    if (filters.startDate || filters.endDate) {
      where.reportedAt = {};
      if (filters.startDate) {
        where.reportedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.reportedAt.lte = new Date(filters.endDate);
      }
    }

    // Filter by city
    if (filters.city) {
      where.city = filters.city;
    }

    const limit = filters.limit ? parseInt(filters.limit, 10) : 1000;

    const reports = await prisma.report.findMany({
      where,
      orderBy: { reportedAt: 'desc' },
      take: limit,
      select: {
        uuid: true,
        types: true, // Array of problem types
        description: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        voivodeship: true,
        reportedAt: true,
        createdAt: true,
        photos: {
          select: {
            id: true,
            url: true,
            filename: true,
          },
        },
      },
    });

    return {
      reports,
      total: reports.length,
    };
  },

  async getById(uuid: string) {
    return await prisma.report.findUnique({
      where: { uuid, status: 'active' },
      select: {
        uuid: true,
        types: true, // Array of problem types
        description: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        voivodeship: true,
        postalCode: true,
        reportedAt: true,
        createdAt: true,
        photos: {
          select: {
            id: true,
            url: true,
            filename: true,
            size: true,
            mimeType: true,
            createdAt: true,
          },
        },
      },
    });
  },

  async create(data: CreateReportData) {
    // Validate max 5 photos
    if (data.photos && data.photos.length > 5) {
      throw new Error('Maximum 5 photos allowed');
    }

    // Save photos if provided
    const photoRecords = [];
    if (data.photos && data.photos.length > 0) {
      for (const photo of data.photos) {
        const savedPhoto = await savePhoto(photo.base64);
        photoRecords.push({
          url: savedPhoto.url,
          filename: savedPhoto.filename,
          size: savedPhoto.size,
          mimeType: photo.mimeType,
        });
      }
    }

    // Reverse geocode if no address
    let address = data.address;
    if (!address) {
      const geocodeResult = await geocodeService.reverse(data.latitude, data.longitude);
      address = geocodeResult.address;
    }

    // Generate delete token
    const deleteToken = crypto.randomUUID();

    const report = await prisma.report.create({
      data: {
        types: data.types, // Array of problem types
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        address,
        contactEmail: data.contactEmail,
        reportedAt: new Date(data.reportedAt),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deleteToken,
        photos: {
          create: photoRecords, // Create related photos
        },
      },
      include: {
        photos: true,
      },
    });

    return {
      id: report.uuid,
      deleteToken,
      message: 'Report created successfully',
    };
  },

  async delete(uuid: string, deleteToken: string) {
    const report = await prisma.report.findUnique({
      where: { uuid },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    if (report.deleteToken !== deleteToken) {
      throw new Error('Invalid delete token');
    }

    // Check 24 hour window
    const hoursSinceCreation = (Date.now() - report.createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      throw new Error('Delete period expired (24 hours)');
    }

    // Soft delete
    await prisma.report.update({
      where: { uuid },
      data: { status: 'deleted' },
    });
  },
};
```

#### 5.2. Geocoding Service (OpenStreetMap Nominatim)

**Plik: `src/services/geocodeService.ts`**
```typescript
import axios from 'axios';
import { config } from '../config/app';
import { logger } from '../utils/logger';

interface NominatimReverseResponse {
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
    country?: string;
  };
}

export const geocodeService = {
  /**
   * Reverse geocode coordinates to address using OSM Nominatim
   * Usage policy: https://operations.osmfoundation.org/policies/nominatim/
   */
  async reverse(latitude: number, longitude: number): Promise<{
    address: string;
    city?: string;
    postalCode?: string;
  }> {
    try {
      const response = await axios.get<NominatimReverseResponse>(
        `${config.nominatimUrl}/reverse`,
        {
          params: {
            lat: latitude,
            lon: longitude,
            format: 'json',
            addressdetails: 1,
            zoom: 18,
          },
          headers: {
            'User-Agent': `Cola-z-Kranu/${config.nominatimEmail}`,
          },
          timeout: 5000,
        }
      );

      const data = response.data;
      const addr = data.address;

      // Extract city name
      const city = addr.city || addr.town || addr.village;

      // Build address string
      let addressStr = data.display_name;
      if (addr.road) {
        addressStr = addr.house_number
          ? `${addr.road} ${addr.house_number}`
          : addr.road;
        if (city) addressStr += `, ${city}`;
      }

      return {
        address: addressStr,
        city,
        postalCode: addr.postcode,
      };
    } catch (error) {
      logger.error('Nominatim geocoding error:', error);

      // Return minimal data on error
      return {
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      };
    }
  },

  /**
   * Search for locations by query
   */
  async search(query: string): Promise<Array<{
    lat: number;
    lon: number;
    display_name: string;
  }>> {
    try {
      const response = await axios.get(
        `${config.nominatimUrl}/search`,
        {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            limit: 10,
            countrycodes: 'pl', // Limit to Poland
          },
          headers: {
            'User-Agent': `Cola-z-Kranu/${config.nominatimEmail}`,
          },
          timeout: 5000,
        }
      );

      return response.data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        display_name: item.display_name,
      }));
    } catch (error) {
      logger.error('Nominatim search error:', error);
      return [];
    }
  },
};
```

**Uwagi dotyczące Nominatim Usage Policy**:
- Maksymalnie 1 zapytanie na sekundę
- Wymaga User-Agent z email kontaktowym
- Bezpłatne dla normalnego użycia
- W produkcji rozważyć własny serwer Nominatim lub komercyjny plan

### Etap 6: Middleware (Tydzień 3) ⏱️ ~6-8h

#### 6.1. Rate Limiting

**Plik: `src/middleware/rateLimit.ts`**
```typescript
import rateLimit from 'express-rate-limit';
import { config } from '../config/app';

export const rateLimitMiddleware = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
```

#### 6.2. Validation Middleware

**Plik: `src/middleware/validation.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateRequest(
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          error: 'Validation error',
          details: error.message,
        });
      } else {
        next(error);
      }
    }
  };
}
```

#### 6.3. Error Handler

**Plik: `src/middleware/errorHandler.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error('Error:', err);

  if (err.message === 'Report not found') {
    return res.status(404).json({ error: err.message });
  }

  if (err.message === 'Invalid delete token') {
    return res.status(403).json({ error: err.message });
  }

  if (err.message === 'Delete period expired (24 hours)') {
    return res.status(410).json({ error: err.message });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}
```

#### 6.4. File Upload (Multer)

**Plik: `src/middleware/upload.ts`**
```typescript
import multer from 'multer';
import path from 'path';
import { config } from '../config/app';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});
```

### Etap 7: Utilities (Tydzień 3) ⏱️ ~4-6h

#### 7.1. Logger

**Plik: `src/utils/logger.ts`**
```typescript
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },

  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },

  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};
```

#### 7.2. Photo Upload Utility

**Plik: `src/utils/photo.ts`**
```typescript
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { config } from '../config/app';

export async function savePhoto(base64Data: string): Promise<{
  url: string;
  filename: string;
  size: number;
}> {
  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);

  if (!matches) {
    throw new Error('Invalid base64 image format');
  }

  const [, extension, data] = matches;
  const buffer = Buffer.from(data, 'base64');

  // Validate file size
  if (buffer.length > config.maxFileSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }

  // Validate extension
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  if (!allowedExtensions.includes(extension.toLowerCase())) {
    throw new Error('Invalid file type. Allowed: JPG, PNG, WebP, GIF');
  }

  // Generate unique filename
  const hash = createHash('sha256').update(buffer).digest('hex').substring(0, 16);
  const filename = `${Date.now()}-${hash}.${extension}`;

  // Ensure upload directory exists
  await mkdir(config.uploadDir, { recursive: true });

  // Save file
  const filepath = join(config.uploadDir, filename);
  await writeFile(filepath, buffer);

  // Return metadata
  return {
    url: `/uploads/${filename}`,
    filename,
    size: buffer.length,
  };
}
```

### Etap 8: PM2 Configuration (Production) ⏱️ ~2h

**Plik: `ecosystem.config.js`**
```javascript
module.exports = {
  apps: [{
    name: 'water-reports-api',
    script: './dist/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
  }]
};
```

## 3. Podsumowanie Timeline

| Etap | Czas | Zadania |
|------|------|---------|
| Etap 1: Setup | 4-6h | Express + TypeScript + dependencies |
| Etap 2: Database | 4-6h | Prisma schema + migrations + PostGIS |
| Etap 3: Express App | 6-8h | App setup + middleware + static files |
| Etap 4: Routes & Controllers | 8-10h | API routes + controllers |
| Etap 5: Services | 8-10h | Business logic + database queries |
| Etap 6: Middleware | 6-8h | Rate limit + validation + error handling |
| Etap 7: Utilities | 4-6h | Logger + photo upload + helpers |
| Etap 8: PM2 | 2h | Production configuration |
| **RAZEM** | **42-56h** | ~1.5-2 miesiące (part-time) |

## 4. Best Practices

### 4.1. Architektura
- MVC pattern (Routes → Controllers → Services → DB)
- Separation of concerns
- Single responsibility principle
- Dependency injection where needed

### 4.2. Bezpieczeństwo
- Input validation (Zod) na każdym endpoincie
- Rate limiting dla POST endpoints
- Helmet dla security headers
- CORS configuration
- SQL injection prevention (Prisma)

### 4.3. Error Handling
- Centralized error handler
- Proper HTTP status codes
- Meaningful error messages
- Logging all errors

### 4.4. Database
- Use Prisma migrations
- Maintain PostGIS spatial indexes
- Connection pooling
- Soft deletes for user data

---

**Dokument utworzony**: 2025-11-19
**Wersja**: 2.0
**Status**: Ready for implementation
