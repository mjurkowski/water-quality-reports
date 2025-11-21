# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Name**: Cola z Kranu / Water Quality Reports
**Purpose**: Civic platform for reporting water quality issues in Poland
**Stack**: React 18 + Vite, Express.js, TypeScript, Prisma, PostgreSQL + PostGIS, shadcn/ui + Tailwind CSS

This is a Polish water quality reporting platform allowing citizens to submit and view reports of water issues (brown water, bad smell, sediment, etc.) on an interactive map. The application is a monorepo with three separate applications: **website** (one-pager React app), **admin** (React app with routing), and **api** (Express.js backend).

## Development Commands

### Environment Setup
```bash
# Start Docker services (PostgreSQL + PostGIS only)
npm run docker:up
npm run docker:down
npm run docker:logs
npm run docker:reset  # Full reset with volume cleanup

# Development (runs website, admin, and api concurrently)
npm run dev              # Runs all three apps
npm run dev:website      # Website only (port 5173)
npm run dev:admin        # Admin panel only (port 5174)
npm run dev:api          # API only (port 3001)
```

### Database Operations
```bash
# All database commands run in the backend workspace
npm run db:generate       # Generate Prisma Client
npm run db:migrate        # Run migrations (development)
npm run db:migrate:prod   # Deploy migrations (production)
npm run db:push           # Push schema changes without migration
npm run db:seed           # Seed with sample data
npm run db:studio         # Open Prisma Studio (GUI on port 5555)
npm run db:reset          # WARNING: Drops database and re-runs migrations
```

### Testing & Quality
```bash
# Linting and formatting
npm run lint              # Run ESLint on all workspaces
npm run lint:fix          # Auto-fix ESLint issues
npm run format            # Format with Prettier
npm run format:check      # Check Prettier formatting

# Testing
npm run test              # Run all tests (website + admin + api)
npm run test:website      # Run website tests (Vitest)
npm run test:admin        # Run admin tests (Vitest)
npm run test:api          # Run API tests (Jest)

# Pre-deployment check
npm run deploy:check      # Runs lint, test, and build
```

### Build & Deployment
```bash
npm run build                  # Build all three apps
npm run build:website          # Build website only (Vite → dist/)
npm run build:admin            # Build admin only (Vite → dist/)
npm run build:api              # Build API only (TypeScript → dist/)

npm run openapi:generate       # Generate OpenAPI spec from API
npm run openapi:generate-client # Generate TypeScript clients for website & admin

npm run deploy:production      # Deploy to production (runs scripts/deploy.sh)
npm run backup:db              # Backup database
npm run health:check           # Health check endpoint
```

## Architecture

### Monorepo Structure
```
water-quality-reports/
├── website/            # Main website (one-pager, React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # shadcn/ui components (auto-generated)
│   │   │   ├── custom/    # Custom components (e.g. PhotoUpload)
│   │   │   ├── sections/  # One-pager sections (Hero, Form, Map, Stats)
│   │   │   ├── map/       # Map components
│   │   │   └── layout/    # Layout components
│   │   ├── lib/
│   │   │   ├── api/       # RTK Query + OpenAPI generated client
│   │   │   └── utils/     # Utilities (cn(), validation, formatting)
│   │   ├── hooks/         # Custom React hooks
│   │   └── styles/        # Tailwind CSS + shadcn/ui styles
│   ├── public/            # Static assets
│   ├── index.html         # Entry HTML (with SEO meta)
│   ├── vite.config.ts
│   └── package.json
│
├── admin/              # Admin panel (React + Vite + routing)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/        # shadcn/ui components (auto-generated)
│   │   │   ├── tables/    # Data tables (TanStack Table)
│   │   │   ├── forms/     # Forms
│   │   │   └── layout/    # Layout (Sidebar, Header)
│   │   ├── pages/         # Pages (Dashboard, Reports, Stats, Settings)
│   │   ├── lib/
│   │   │   ├── api/       # RTK Query + OpenAPI generated client
│   │   │   └── utils/     # Utilities
│   │   └── styles/        # Tailwind CSS + shadcn/ui styles
│   ├── vite.config.ts
│   └── package.json
│
├── api/                # Express.js API Server
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── db/            # Prisma client + queries
│   │   ├── utils/         # Utilities
│   │   ├── config/        # Configuration
│   │   ├── app.ts         # Express app setup
│   │   └── server.ts      # Server entry point
│   ├── prisma/            # Prisma schema + migrations
│   ├── uploads/           # User uploaded files
│   ├── openapi/           # OpenAPI specification
│   ├── ecosystem.config.js # PM2 configuration
│   └── package.json
│
├── shared/             # Shared types/constants (optional)
├── config/             # Docker configs
├── scripts/            # Deployment scripts
├── tests/              # Tests (website + admin + api)
└── package.json        # Root workspace config
```

### Technology Stack

**Frontend (Website & Admin)**:
- React 18 with Vite (fast build tool)
- TypeScript (strict mode)
- shadcn/ui + Tailwind CSS (UI components & styling)
- Redux Toolkit (RTK) + RTK Query (state & API client)
- OpenAPI TypeScript code generation (type-safe API)
- React Router v6 (admin panel only)
- Leaflet + Leaflet.markercluster (interactive maps)
- MapTiler (map tiles)
- React Hook Form + Zod (forms + validation)
- Recharts (statistics charts)
- TanStack Table v8 (data tables in admin)

**Backend**:
- Express.js (REST API)
- Prisma ORM (type-safe database access)
- PostgreSQL 16 + PostGIS (spatial database)
- Zod (input validation)
- Multer (file uploads)
- helmet, cors, express-rate-limit (security)
- PM2 (process manager for production)

**Infrastructure**:
- Docker Compose (local development - PostgreSQL + PostGIS only)
- myDevil shared hosting (production)
- GitHub Actions (CI/CD - tag-based deployment)
- OSM Nominatim (free geocoding API)

## Key Concepts

### Database Schema

The main entity is `Report` with PostGIS spatial support:
```prisma
model Report {
  id           Int      @id @default(autoincrement())
  uuid         String   @unique @default(uuid())
  types        String[] // Array: ['brown_water', 'bad_smell', ...] (1-3 types)
  description  String?
  latitude     Float
  longitude    Float
  // + location GEOMETRY(POINT, 4326) via migration trigger
  address      String?
  city         String?
  voivodeship  String?
  photos       Photo[]  // One-to-many relationship (max 5 photos)
  contactEmail String?
  reportedAt   DateTime
  status       String   @default("active")  // 'active', 'deleted', 'spam'
  deleteToken  String?  // For 24h deletion window
  // ... timestamps, metadata
}

model Photo {
  id        Int      @id @default(autoincrement())
  reportId  Int
  report    Report   @relation(fields: [reportId], references: [id], onDelete: Cascade)
  url       String   // Storage path or base64 data
  mimeType  String   // e.g., 'image/jpeg', 'image/png'
  size      Int      // File size in bytes
  createdAt DateTime @default(now())
}
```

A PostGIS trigger automatically maintains the `location` column from `latitude`/`longitude`.

### API Endpoints

- `GET /api/reports` - List reports with filters (bounds, type, date range)
- `POST /api/reports` - Create new report (with rate limiting)
- `GET /api/reports/:uuid` - Get report details
- `DELETE /api/reports/:uuid` - Delete report (requires deleteToken, 24h window)
- `GET /api/stats?period=week|month|year|all` - Get statistics
- `GET /api/geocode?q=query` - Forward geocoding via OSM Nominatim
- `GET /api/health` - Health check (database connectivity)

### Report Types
```typescript
const reportTypes = [
  'brown_water',      // Brunatna woda
  'bad_smell',        // Nieprzyjemny zapach
  'sediment',         // Osad/zawiesiny
  'pressure',         // Niskie ciśnienie
  'no_water',         // Brak wody
  'other'             // Inne
];
```

### Environment Variables

**Website** (website/.env):
```bash
VITE_API_URL=http://localhost:3001/api
VITE_APP_URL=http://localhost:5173
VITE_MAPTILER_KEY=<your_maptiler_key>  # Get from maptiler.com
```

**Admin** (admin/.env):
```bash
VITE_API_URL=http://localhost:3001/api
VITE_ADMIN_URL=http://localhost:5174
```

**API** (api/.env):
```bash
NODE_ENV=development
PORT=3001
WEBSITE_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
DATABASE_URL=postgresql://waterreports:dev_password_123@localhost:5432/water_reports_dev
NOMINATIM_URL=https://nominatim.openstreetmap.org
NOMINATIM_EMAIL=your-email@example.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB per photo
MAX_PHOTOS=5           # Max 5 photos per report
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=10
```

## Development Workflow

### Starting Development
1. Start Docker services: `npm run docker:up`
2. Run migrations: `npm run db:migrate`
3. (Optional) Seed data: `npm run db:seed`
4. Start development servers: `npm run dev`
5. Website: http://localhost:5173
6. Admin panel: http://localhost:5174
7. API: http://localhost:3001/api

### Before Committing
1. Run linting: `npm run lint`
2. Run tests: `npm run test`
3. Format code: `npm run format`
4. Check all: `npm run deploy:check`

### Creating Features
1. Create feature branch: `git checkout -b feature/feature-name`
2. Implement changes following existing patterns
3. Write tests (unit + integration)
4. Ensure all checks pass: `npm run deploy:check`
5. Create pull request

## Important Patterns

### TypeScript Path Aliases
```typescript
// Website & Admin
import { Button } from '@/components/ui/button';  // shadcn/ui component
import { useGetReportsQuery } from '@/lib/api/api';  // RTK Query hook
import { cn } from '@/lib/utils/utils';  // shadcn/ui cn() helper

// API
import { prisma } from '@/db/client';
import { logger } from '@/utils/logger';
```

### Frontend - RTK Query + OpenAPI
All API calls use RTK Query with OpenAPI-generated types:
```typescript
import { useGetReportsQuery, useCreateReportMutation } from '@/lib/api/api';

// In component - automatic caching & refetching
function ReportsPage() {
  const { data, isLoading, error } = useGetReportsQuery({ limit: 100 });
  const [createReport, { isLoading: isCreating }] = useCreateReportMutation();

  const handleSubmit = async (formData) => {
    await createReport(formData).unwrap();
  };

  return <div>{data?.reports.map(report => ...)}</div>;
}
```

### Backend - MVC Pattern
Routes → Controllers → Services → Database:
```typescript
// Route: backend/src/routes/reports.ts
router.get('/', reportsController.getAll);

// Controller: backend/src/controllers/reportsController.ts
export const reportsController = {
  async getAll(req, res, next) {
    const result = await reportService.getAll(req.query);
    res.json(result);
  }
};

// Service: backend/src/services/reportService.ts
export const reportService = {
  async getAll(filters) {
    return await prisma.report.findMany({ ... });
  }
};
```

### Form Validation (Shared)
Zod schemas are used for validation on both frontend and backend:
```typescript
// Shared schema
const reportFormSchema = z.object({
  type: z.enum(['brown_water', 'bad_smell', ...]),
  latitude: z.number().min(-90).max(90),
  // ...
});

// Frontend (React Hook Form)
const { register, handleSubmit } = useForm({
  resolver: zodResolver(reportFormSchema)
});

// Backend (Express middleware)
router.post('/', validateRequest(reportFormSchema), controller.create);
```

### Website Architecture (One-pager)
Website has NO routing - it's a single-page application with smooth-scroll sections:
```typescript
// website/src/App.tsx
function App() {
  return (
    <Provider store={store}>
      <Header />  {/* Smooth scroll navigation */}
      <main>
        <HeroSection />
        <ReportFormSection />
        <MapSection />
        <StatsSection />
        <AboutSection />
      </main>
      <Footer />
    </Provider>
  );
}
```

### Admin Panel Routing
Only admin panel uses React Router:
```typescript
// admin/src/App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<AdminLayout />}>
      <Route index element={<Navigate to="/dashboard" />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="reports" element={<ReportsPage />} />
      <Route path="reports/:uuid" element={<ReportDetailPage />} />
      <Route path="stats" element={<StatsPage />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### Rate Limiting (Backend)
POST endpoints should use rate limiting:
```typescript
import { rateLimitMiddleware } from '@/middleware/rateLimit';

router.post('/reports', rateLimitMiddleware, controller.create);
```

### Map Components (Frontend)
Maps use Leaflet directly (not react-leaflet for better control):
```typescript
import L from 'leaflet';

const map = L.map(container).setView([52, 19], 6);
L.tileLayer(`https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${key}`).addTo(map);
```

## Testing Strategy

### Frontend Tests (Vitest)
- Unit tests for utilities, formatters
- Component tests with React Testing Library
- Located in `frontend/src/**/*.test.tsx`
- Run with: `npm run test:frontend`

### Backend Tests (Jest + Supertest)
- Unit tests for services, utilities
- Integration tests for API endpoints
- Located in `backend/tests/`
- Run with: `npm run test:backend`

## Security Considerations

- **Input Validation**: All inputs validated with Zod schemas (frontend + backend)
- **SQL Injection**: Protected by Prisma ORM
- **XSS Prevention**: React escapes by default, sanitize user descriptions
- **Rate Limiting**: Applied to POST /api/reports (10 req/min per IP)
- **CORS**: Configured to allow only frontend origin
- **Helmet**: Security headers applied on backend
- **File Upload**: 5MB limit, type validation (images only)
- **Deletion**: 24-hour window with deleteToken, prevents unauthorized deletion

## Performance

### Database
- Spatial index on PostGIS `location` column (GIST)
- Composite indexes on frequently queried combinations
- Prisma connection pooling
- Queries limited to max 1000 results

### Frontend
- Vite for fast builds and HMR
- Code splitting with dynamic imports
- Image optimization (planned)
- Client-side caching for stats (5 min TTL)
- Lazy loading for map components

### Backend
- Compression middleware for responses
- Static file serving with Express
- PM2 process manager in production

## Deployment

The app deploys to myDevil shared hosting:

1. Build: `npm run build`
2. Backend migrates: `npm run db:migrate:prod` (in backend/)
3. Upload files via rsync (see `scripts/deploy.sh`)
4. PM2 restarts backend
5. Health check: `npm run health:check`

Frontend is served as static files from Express (`backend/src/app.ts`):
```typescript
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  app.get('*', (req, res) => res.sendFile('index.html'));
}
```

GitHub Actions automates deployment on push to `main`.

## Common Tasks

### Adding a New Report Type
1. Update `shared/constants/report-types.ts` (if using shared)
2. Update validation in `frontend/src/lib/utils/validation.ts`
3. Update validation in `backend/src/utils/validation.ts`
4. Update marker colors in `frontend/src/components/map/Map.tsx`
5. Add Polish translation labels

### Modifying Database Schema
1. Update `backend/prisma/schema.prisma`
2. Create migration: `npm run db:migrate` (in backend/)
3. TypeScript types auto-generate
4. Update services if needed (`backend/src/services/`)

### Adding a New API Endpoint
1. Create route in `backend/src/routes/[name].ts`
2. Add controller in `backend/src/controllers/[name]Controller.ts`
3. Add service logic in `backend/src/services/[name]Service.ts`
4. Define Zod validation schema
5. Add integration tests in `backend/tests/integration/`
6. Update frontend API client in `frontend/src/lib/api/[name].ts`

### Running Single Test File
```bash
# Frontend (Vitest)
cd frontend
npm run test -- src/components/ui/Button.test.tsx

# Backend (Jest)
cd backend
npm run test -- tests/integration/api/reports.test.ts
```

## Troubleshooting

### Port Conflicts
- **Frontend (5173)**: Change in `frontend/vite.config.ts` → `server.port`
- **Backend (3001)**: Change `PORT` in `backend/.env`
- **PostgreSQL (5432)**: Change port in `config/docker/docker-compose.yml` and update `DATABASE_URL`

### Database Connection Issues
1. Check Docker: `docker ps | grep water-reports-db`
2. Check logs: `docker logs water-reports-db`
3. Test connection: `docker exec -it water-reports-db psql -U waterreports`
4. Verify `DATABASE_URL` in `backend/.env`

### Prisma Client Issues
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run db:generate
```

### Map Not Loading (Frontend)
- Verify `VITE_MAPTILER_KEY` in `frontend/.env`
- Check MapTiler account limits (100k requests/month on free tier)
- Restart dev server after changing env vars: `npm run dev:frontend`

### Geocoding Not Working
- Check Nominatim URL: `NOMINATIM_URL` in `api/.env`
- Test API: `curl "https://nominatim.openstreetmap.org/search?q=warszawa&format=json"`
- Ensure `NOMINATIM_EMAIL` is set (required by Nominatim usage policy)
- Rate limit: Nominatim has strict rate limits (1 req/sec), consider caching

### Vite Build Fails (Website or Admin)
```bash
cd website  # or cd admin
rm -rf node_modules .vite dist
npm install
npm run build
```

### Express Server Won't Start
```bash
cd api
rm -rf node_modules dist
npm install
npm run build
npm run dev
```

### shadcn/ui Component Issues
```bash
# Re-install shadcn/ui component
cd website  # or cd admin
npx shadcn-ui@latest add button  # or other component
```

## Project Context

This is a civic tech project built for Polish citizens. All UI text is in Polish, with focus on:
- **Accessibility**: Simple forms, clear navigation, mobile-first
- **Privacy**: Minimal data collection, optional email, 24h deletion window
- **Performance**: Optimized for shared hosting (myDevil), efficient queries, caching
- **RODO/GDPR Compliance**: Polish data protection regulations

The platform targets deployment on affordable shared hosting (myDevil.net) rather than cloud providers, making it sustainable for civic projects with limited budgets.

## Important Notes

- **Polish Language**: All user-facing text is in Polish
- **Date Format**: ISO 8601 for API, Polish format (DD.MM.YYYY) for display
- **Map Center**: Default to Poland (lat: 52.0, lng: 19.0)
- **Voivodeships**: Polish administrative divisions (16 voivodeships)
- **PostGIS**: Required for spatial queries, automatically synced via trigger
- **Monorepo**: Use workspace commands from root, or run directly in frontend/backend folders
