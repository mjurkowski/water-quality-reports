# Struktura Repozytorium i Narzędzia Deweloperskie

## 1. Struktura Katalogów

```
water-quality-reports/
│
├── .github/                      # GitHub Actions workflows
│   └── workflows/
│       ├── ci.yml               # Continuous Integration
│       ├── deploy-production.yml # Deploy on git tag (not branch push)
│       └── test.yml             # Automated tests
│
├── website/                      # Main website (one-pager, React + Vite)
│   ├── public/                  # Static assets
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   └── placeholder.png
│   │   ├── icons/
│   │   │   └── marker-*.svg
│   │   ├── favicon.ico
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   │
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ui/             # shadcn/ui components (auto-generated)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   └── badge.tsx
│   │   │   │
│   │   │   ├── custom/         # Project-specific custom components
│   │   │   │   └── PhotoUpload.tsx
│   │   │   │
│   │   │   ├── sections/       # One-pager sections
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── ReportFormSection.tsx
│   │   │   │   ├── MapSection.tsx
│   │   │   │   ├── StatsSection.tsx
│   │   │   │   ├── AboutSection.tsx
│   │   │   │   └── FooterSection.tsx
│   │   │   │
│   │   │   ├── forms/          # Form components
│   │   │   │   ├── ReportForm.tsx
│   │   │   │   └── FilterForm.tsx
│   │   │   │
│   │   │   ├── map/            # Map components
│   │   │   │   ├── Map.tsx
│   │   │   │   ├── MarkerCluster.tsx
│   │   │   │   ├── ReportMarker.tsx
│   │   │   │   └── LocationPicker.tsx
│   │   │   │
│   │   │   └── stats/          # Statistics components
│   │   │       ├── StatsCard.tsx
│   │   │       ├── Chart.tsx
│   │   │       └── TrendGraph.tsx
│   │   │
│   │   ├── lib/                # Frontend utilities
│   │   │   ├── api/            # API client (RTK Query + OpenAPI)
│   │   │   │   ├── store.ts    # Redux store
│   │   │   │   ├── api.ts      # RTK Query API
│   │   │   │   └── generated/  # OpenAPI generated types & endpoints
│   │   │   │
│   │   │   ├── utils/          # Utility functions
│   │   │   │   ├── utils.ts    # shadcn/ui cn() helper
│   │   │   │   ├── validation.ts # Zod schemas
│   │   │   │   ├── formatting.ts # Data formatting
│   │   │   │   └── date.ts     # Date utilities
│   │   │   │
│   │   │   └── constants/      # Constants & config
│   │   │       ├── report-types.ts
│   │   │       ├── voivodeships.ts
│   │   │       └── map-config.ts
│   │   │
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useReports.ts
│   │   │   ├── useStats.ts
│   │   │   └── useGeolocation.ts
│   │   │
│   │   ├── styles/             # Global styles
│   │   │   └── index.css       # Tailwind CSS + shadcn/ui styles
│   │   │
│   │   ├── App.tsx             # Main App component (one-pager layout)
│   │   ├── main.tsx            # Vite entry point
│   │   └── vite-env.d.ts       # Vite type definitions
│   │
│   ├── index.html              # HTML entry point (with SEO meta)
│   ├── vite.config.ts          # Vite configuration
│   ├── tsconfig.json           # TypeScript config
│   ├── tsconfig.node.json      # TypeScript config for Vite
│   ├── package.json            # Website dependencies
│   └── .env.example            # Environment variables example
│
├── admin/                       # Admin panel (React + Vite + routing)
│   ├── public/
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/          # Admin UI components
│   │   │   ├── ui/             # shadcn/ui components (auto-generated)
│   │   │   ├── tables/
│   │   │   │   ├── ReportsTable.tsx
│   │   │   │   └── UsersTable.tsx
│   │   │   ├── forms/
│   │   │   │   └── ReportEditForm.tsx
│   │   │   └── layout/
│   │   │       ├── Sidebar.tsx
│   │   │       ├── Header.tsx
│   │   │       └── AdminLayout.tsx
│   │   │
│   │   ├── pages/              # Admin pages (with routing)
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── ReportDetailPage.tsx
│   │   │   ├── StatsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   │
│   │   ├── lib/                # Admin utilities
│   │   │   ├── api/            # API client (RTK Query + OpenAPI)
│   │   │   │   ├── store.ts
│   │   │   │   ├── api.ts
│   │   │   │   └── generated/
│   │   │   └── utils/
│   │   │
│   │   ├── App.tsx             # Main App with routing
│   │   └── main.tsx
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json            # Admin panel dependencies
│   └── .env.example
│
├── api/                         # Express.js API Server
│   ├── src/
│   │   ├── routes/             # API routes
│   │   │   ├── index.ts        # Routes index
│   │   │   ├── reports.ts      # /api/reports routes
│   │   │   ├── stats.ts        # /api/stats routes
│   │   │   ├── geocode.ts      # /api/geocode routes
│   │   │   └── health.ts       # /api/health route
│   │   │
│   │   ├── controllers/        # Route controllers
│   │   │   ├── reportsController.ts
│   │   │   ├── statsController.ts
│   │   │   └── geocodeController.ts
│   │   │
│   │   ├── services/           # Business logic
│   │   │   ├── reportService.ts
│   │   │   ├── statsService.ts
│   │   │   └── geocodeService.ts
│   │   │
│   │   ├── middleware/         # Express middleware
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimit.ts
│   │   │   ├── validation.ts
│   │   │   └── upload.ts       # Multer config
│   │   │
│   │   ├── db/                 # Database layer
│   │   │   ├── client.ts       # Prisma client singleton
│   │   │   └── queries.ts      # Database queries
│   │   │
│   │   ├── utils/              # Backend utilities
│   │   │   ├── validation.ts   # Zod schemas (shared)
│   │   │   ├── logger.ts       # Logging utility
│   │   │   └── errors.ts       # Error classes
│   │   │
│   │   ├── config/             # Configuration
│   │   │   ├── database.ts     # Database config
│   │   │   ├── app.ts          # App config
│   │   │   └── constants.ts    # Constants
│   │   │
│   │   ├── app.ts              # Express app setup
│   │   └── server.ts           # Server entry point
│   │
│   ├── prisma/                 # Prisma ORM
│   │   ├── schema.prisma       # Database schema
│   │   ├── seed.ts             # Database seeding
│   │   └── migrations/         # Generated migrations
│   │
│   ├── uploads/                # User uploaded files (gitignored)
│   │   └── .gitkeep
│   │
│   ├── openapi/                # OpenAPI specification
│   │   └── openapi.yaml        # Generated OpenAPI 3.0 spec
│   │
│   ├── package.json            # API dependencies
│   ├── tsconfig.json           # TypeScript config
│   ├── .env.example            # Environment variables example
│   └── ecosystem.config.js     # PM2 config for production
│
├── shared/                      # Shared code (types, constants)
│   ├── types/
│   │   ├── report.ts
│   │   └── api.ts
│   └── constants/
│       └── report-types.ts
│
├── scripts/                     # Utility scripts
│   ├── deploy.sh               # Deployment script
│   ├── backup-db.sh            # Database backup
│   ├── seed-dev-data.ts        # Development data seeding
│   └── check-health.sh         # Health check script
│
├── tests/                       # Tests
│   ├── website/                # Website tests
│   │   ├── unit/
│   │   │   └── components/
│   │   ├── integration/
│   │   └── e2e/
│   │       └── playwright.config.ts
│   │
│   ├── admin/                  # Admin panel tests
│   │   ├── unit/
│   │   └── e2e/
│   │
│   └── api/                    # API tests
│       ├── unit/
│       │   ├── controllers/
│       │   └── services/
│       ├── integration/
│       │   └── api/
│       └── setup/
│           └── test-db-setup.ts
│
├── config/                      # Configuration files
│   ├── docker/                 # Docker configs (local development only)
│   │   └── docker-compose.yml  # PostgreSQL + PostGIS only
│   │
│   ├── nginx/                  # Nginx config (if needed)
│   │   └── nginx.conf
│   │
│   └── environments/           # Environment configs
│       ├── .env.local.example
│       ├── .env.production.example
│       └── .env.test.example
│
├── docs/                        # Documentation
│   ├── 01-zalozenia-i-specyfikacja.md
│   ├── 02-struktura-repozytorium.md
│   ├── 03-proces-wydawania.md
│   ├── 04-implementacja-frontend.md
│   ├── 05-implementacja-backend.md
│   ├── 06-konfiguracja-lokalna.md
│   ├── 07-setup-produkcyjny.md
│   ├── api/                    # API documentation
│   │   └── endpoints.md
│   └── guides/                 # Development guides
│       └── contributing.md
│
├── .gitignore                  # Git ignore rules
├── .eslintrc.json              # ESLint configuration (root)
├── .prettierrc                 # Prettier configuration
├── package.json                # Root package.json (workspace)
├── CHANGELOG.md                # Version history
├── README.md                   # Project overview
├── CLAUDE.md                   # Claude Code guidance
└── LICENSE                     # License file
```

## 2. Konfiguracja Środowisk

### 2.1. Lokalne (Docker)

**Plik: `config/docker/docker-compose.yml`**
```yaml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:16-3.4
    container_name: water-reports-db
    environment:
      POSTGRES_USER: waterreports
      POSTGRES_PASSWORD: dev_password_123
      POSTGRES_DB: water_reports_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U waterreports"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

**Uwaga**: Photon i Redis zostały usunięte ze stosu:
- **Geocoding**: OpenStreetMap Nominatim API (darmowe, bez potrzeby self-hostingu)
- **Caching**: Rozważyć MongoDB w przyszłości lub pominąć (brak Redis na myDevil)

### 2.2. Environment Variables

**Website: `website/.env.example`**
```bash
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_APP_URL=http://localhost:5173

# MapTiler
VITE_MAPTILER_KEY=get_your_free_key_at_maptiler_com

# Features
VITE_ENABLE_ANALYTICS=false
```

**Admin: `admin/.env.example`**
```bash
# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_ADMIN_URL=http://localhost:5174

# Auth (future implementation)
VITE_AUTH_ENABLED=false
```

**API: `api/.env.example`**
```bash
# Application
NODE_ENV=development
PORT=3001
WEBSITE_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Database
DATABASE_URL=postgresql://waterreports:dev_password_123@localhost:5432/water_reports_dev

# Geocoding (OpenStreetMap Nominatim)
NOMINATIM_URL=https://nominatim.openstreetmap.org
NOMINATIM_EMAIL=your-email@example.com  # Required by Nominatim usage policy

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB per photo
MAX_PHOTOS=5           # Max 5 photos per report

# Security
JWT_SECRET=dev_secret_change_in_production
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Rate Limiting
RATE_LIMIT_WINDOW=60000  # 1 minute
RATE_LIMIT_MAX_REQUESTS=10

# Security (optional)
RECAPTCHA_SECRET_KEY=

# Monitoring (optional)
SENTRY_DSN=
```

**Production: `config/environments/.env.production.example`**
```bash
# Application
NODE_ENV=production
PORT=3001
WEBSITE_URL=https://cola-z-kranu.pl
ADMIN_URL=https://admin.cola-z-kranu.pl

# Database (myDevil PostgreSQL)
DATABASE_URL=postgresql://m1234_waterreports:prod_password@mysql84.mydevil.net:5432/m1234_waterreports

# Geocoding (OpenStreetMap Nominatim)
NOMINATIM_URL=https://nominatim.openstreetmap.org
NOMINATIM_EMAIL=contact@cola-z-kranu.pl

# File Upload
UPLOAD_DIR=/home/m1234/domains/cola-z-kranu.pl/uploads
MAX_FILE_SIZE=5242880
MAX_PHOTOS=5

# Security
JWT_SECRET=strong_random_secret_here
CORS_ORIGIN=https://cola-z-kranu.pl,https://admin.cola-z-kranu.pl

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=10

# Security
RECAPTCHA_SECRET_KEY=production_secret_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## 3. Narzędzia Deweloperskie

### 3.1. Root Package.json (Workspace)

**Plik: `package.json`**
```json
{
  "name": "water-quality-reports",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "website",
    "admin",
    "api"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:website\" \"npm run dev:admin\"",
    "dev:website": "npm run dev --workspace=website",
    "dev:admin": "npm run dev --workspace=admin",
    "dev:api": "npm run dev --workspace=api",

    "build": "npm run build:website && npm run build:admin && npm run build:api",
    "build:website": "npm run build --workspace=website",
    "build:admin": "npm run build --workspace=admin",
    "build:api": "npm run build --workspace=api",

    "test": "npm run test:website && npm run test:admin && npm run test:api",
    "test:website": "npm run test --workspace=website",
    "test:admin": "npm run test --workspace=admin",
    "test:api": "npm run test --workspace=api",

    "lint": "npm run lint --workspaces",
    "lint:fix": "npm run lint:fix --workspaces",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,jsx,json,css,md}\"",

    "db:generate": "npm run db:generate --workspace=api",
    "db:migrate": "npm run db:migrate --workspace=api",
    "db:migrate:prod": "npm run db:migrate:prod --workspace=api",
    "db:seed": "npm run db:seed --workspace=api",
    "db:studio": "npm run db:studio --workspace=api",
    "db:reset": "npm run db:reset --workspace=api",

    "openapi:generate": "npm run openapi:generate --workspace=api",
    "openapi:generate-client": "npm run openapi:generate-client --workspace=website && npm run openapi:generate-client --workspace=admin",

    "docker:up": "docker compose -f config/docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f config/docker/docker-compose.yml down",
    "docker:logs": "docker compose -f config/docker/docker-compose.yml logs -f",
    "docker:reset": "docker compose -f config/docker/docker-compose.yml down -v && npm run docker:up",

    "deploy:check": "npm run lint && npm run test && npm run build",
    "deploy:production": "bash scripts/deploy.sh",
    "backup:db": "bash scripts/backup-db.sh",
    "health:check": "bash scripts/check-health.sh"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "prettier": "^3.1.0",
    "typescript": "^5.3.2"
  }
}
```

### 3.2. Website Package.json

**Plik: `website/package.json`**
```json
{
  "name": "water-reports-website",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 5173",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "openapi:generate-client": "openapi-typescript ../api/openapi/openapi.yaml -o src/lib/api/generated/schema.ts"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1",
    "leaflet.markercluster": "^1.5.3",
    "recharts": "^2.10.3",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-checkbox": "^1.0.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.42",
    "@types/react-dom": "^18.2.17",
    "@types/leaflet": "^1.9.8",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.0",
    "typescript": "^5.3.2",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "openapi-typescript": "^6.7.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### 3.3. Admin Package.json

**Plik: `admin/package.json`**
```json
{
  "name": "water-reports-admin",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 5174",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "test": "vitest",
    "openapi:generate-client": "openapi-typescript ../api/openapi/openapi.yaml -o src/lib/api/generated/schema.ts"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@reduxjs/toolkit": "^2.0.0",
    "react-redux": "^9.0.0",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "recharts": "^2.10.3",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-avatar": "^1.0.4",
    "@tanstack/react-table": "^8.10.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.42",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.0",
    "typescript": "^5.3.2",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.2",
    "openapi-typescript": "^6.7.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

### 3.4. API Package.json

**Plik: `api/package.json`**
```json
{
  "name": "water-reports-api",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "start:pm2": "pm2 start ecosystem.config.js",
    "lint": "eslint . --ext ts --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",

    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset --force",

    "openapi:generate": "tsx scripts/generate-openapi.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^5.7.0",
    "zod": "^3.22.4",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.3.1",
    "compression": "^1.7.4",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/cors": "^2.8.17",
    "@types/multer": "^1.4.11",
    "@types/compression": "^1.7.5",
    "typescript": "^5.3.2",
    "tsx": "^4.7.0",
    "prisma": "^5.7.0",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2",
    "pm2": "^5.3.0",
    "@asteasolutions/zod-to-openapi": "^7.0.0"
  }
}
```

### 3.5. Vite Configuration

**Plik: `website/vite.config.ts`** i **`admin/vite.config.ts`**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'form-vendor': ['react-hook-form', 'zod'],
        },
      },
    },
  },
});
```

### 3.6. TypeScript Configurations

**Website/Admin: `website/tsconfig.json` i `admin/tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**API: `api/tsconfig.json`**
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

### 3.7. PM2 Configuration (Production)

**Plik: `api/ecosystem.config.js`**
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
    time: true
  }]
};
```

### 3.8. Git Configuration

**Plik: `.gitignore`**
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Build outputs
website/dist/
admin/dist/
api/dist/
build/

# Environment variables
.env
.env*.local
.env.production
website/.env
admin/.env
api/.env

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# OS
.DS_Store
Thumbs.db

# IDEs
.idea/
.vscode/
*.swp
*.swo
*~

# Uploads
api/uploads/*
!api/uploads/.gitkeep

# Database
*.db
*.sqlite

# PM2
api/logs/
.pm2/

# Generated files
website/src/lib/api/generated/
admin/src/lib/api/generated/
api/openapi/openapi.yaml

# Misc
.cache/
```

## 4. Deployment Scripts

### 4.1. Deploy Script

**Plik: `scripts/deploy.sh`**
```bash
#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# 1. Pre-deployment checks
echo "📋 Running pre-deployment checks..."
npm run lint
npm run test

# 2. Build application
echo "🏗️  Building application..."
npm run build

# 3. Generate OpenAPI spec
echo "📝 Generating OpenAPI specification..."
npm run openapi:generate

# 4. Generate API clients
echo "🔧 Generating API clients..."
npm run openapi:generate-client

# 5. Database migration (production)
echo "🗄️  Running database migrations..."
cd api
npm run db:migrate:prod
cd ..

# 6. Backup current deployment
echo "💾 Creating backup..."
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 7. Deploy to production (rsync or FTP)
echo "📤 Deploying to production..."

# Upload API
rsync -avz --delete \
  -e "ssh -p 22" \
  ./api/dist/ \
  ./api/node_modules/ \
  ./api/package.json \
  ./api/ecosystem.config.js \
  user@server:/home/user/water-reports/api/

# Upload website
rsync -avz --delete \
  -e "ssh -p 22" \
  ./website/dist/ \
  user@server:/home/user/water-reports/website/

# Upload admin panel
rsync -avz --delete \
  -e "ssh -p 22" \
  ./admin/dist/ \
  user@server:/home/user/water-reports/admin/

# 8. Restart API (PM2)
echo "🔄 Restarting API..."
ssh user@server "cd /home/user/water-reports/api && pm2 restart ecosystem.config.js"

# 7. Health check
echo "🏥 Running health check..."
sleep 5
npm run health:check

echo "✅ Deployment completed successfully!"
```

---

**Dokument utworzony**: 2025-11-19
**Wersja**: 2.1 (zaktualizowano: shadcn/ui + Tailwind CSS structure)
**Status**: Ready for implementation
