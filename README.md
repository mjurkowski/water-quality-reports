# Cola z Kranu - Water Quality Reports

Platforma do zgłaszania problemów z jakością wody w Polsce.

## Szybki Start

### 1. Wymagania
- Node.js 20+ LTS
- Docker & Docker Compose
- npm 10+

### 2. Instalacja

```bash
# Klonuj repozytorium
git clone <repo-url>
cd bad-water

# Zainstaluj dependencies
npm install

# Skopiuj przykładowy plik środowiskowy
cp api/.env.example api/.env

# Uruchom Docker (PostgreSQL + PostGIS)
npm run docker:up

# Wygeneruj Prisma Client
npm run db:generate

# Uruchom migracje
npm run db:migrate

# (Opcjonalnie) Załaduj przykładowe dane
npm run db:seed
```

### 3. Uruchomienie

```bash
# Backend API (port 3001)
npm run dev:api

# W przyszłości: Website (port 5173) i Admin (port 5174)
# npm run dev:website
# npm run dev:admin

# Lub wszystko naraz:
# npm run dev
```

### 4. Sprawdzenie

- API Health Check: http://localhost:3001/api/health
- API Reports: http://localhost:3001/api/reports
- Prisma Studio: `npm run db:studio` → http://localhost:5555

## Struktura Projektu

```
bad-water/
├── api/              # Express.js Backend API
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Controllers
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   ├── db/          # Prisma client
│   │   ├── utils/       # Utilities
│   │   └── config/      # Configuration
│   ├── prisma/          # Prisma schema + migrations
│   └── uploads/         # User uploaded files
│
├── website/          # Website (React + Vite) - TODO
├── admin/            # Admin panel (React + Vite) - TODO
├── config/           # Docker configs
├── scripts/          # Deployment scripts
└── docs/             # Documentation
```

## API Endpoints

### Reports
- `GET /api/reports` - Lista zgłoszeń (z filtrami)
- `GET /api/reports/:uuid` - Szczegóły zgłoszenia
- `POST /api/reports` - Nowe zgłoszenie (rate limited)
- `DELETE /api/reports/:uuid` - Usuń zgłoszenie (wymaga deleteToken)

### Stats
- `GET /api/stats?period=week|month|year|all` - Statystyki

### Geocoding
- `GET /api/geocode?q=query` - Wyszukiwanie adresów

### Health
- `GET /api/health` - Status serwera

## Typy Problemów

- `brown_water` - Brunatna woda
- `bad_smell` - Nieprzyjemny zapach
- `sediment` - Osad/zawiesiny
- `pressure` - Niskie ciśnienie
- `no_water` - Brak wody
- `other` - Inne

## Skrypty NPM

### Development
```bash
npm run dev:api           # Start API dev server
npm run db:studio         # Prisma Studio GUI
npm run docker:logs       # Zobacz logi Docker
```

### Database
```bash
npm run db:generate       # Generuj Prisma Client
npm run db:migrate        # Uruchom migracje
npm run db:seed           # Załaduj przykładowe dane
npm run db:reset          # Reset bazy (USUWA DANE!)
```

### Docker
```bash
npm run docker:up         # Start PostgreSQL
npm run docker:down       # Stop kontenerów
npm run docker:reset      # Full reset (usuwa volumes)
```

### Testing & Quality
```bash
npm run lint              # ESLint
npm run format            # Prettier
npm run test              # Testy (TODO)
```

### Build & Deploy
```bash
npm run build             # Build produkcyjny
npm run deploy:check      # Pre-deployment check
```

## Zmienne Środowiskowe

Zobacz [api/.env.example](api/.env.example) dla pełnej listy.

Kluczowe:
- `DATABASE_URL` - PostgreSQL connection string
- `NOMINATIM_EMAIL` - Email dla OSM Nominatim (required!)
- `CORS_ORIGIN` - Dozwolone origins (frontend URLs)
- `PORT` - Port API (default: 3001)

## Technologie

### Backend
- Express.js - REST API framework
- Prisma ORM - Type-safe database access
- PostgreSQL 16 + PostGIS - Spatial database
- Zod - Input validation
- Axios - HTTP client (Nominatim)

### Frontend (TODO)
- React 18 + Vite
- shadcn/ui + Tailwind CSS
- Redux Toolkit + RTK Query
- Leaflet - Interactive maps

## Dokumentacja

- [01-zalozenia-i-specyfikacja.md](01-zalozenia-i-specyfikacja.md)
- [02-struktura-repozytorium.md](02-struktura-repozytorium.md)
- [05-implementacja-backend.md](05-implementacja-backend.md)
- [06-konfiguracja-lokalna.md](06-konfiguracja-lokalna.md)
- [CLAUDE.md](CLAUDE.md) - Instrukcje dla Claude Code

## Status Implementacji

✅ Backend API (Express + Prisma + PostGIS)
✅ Docker Setup (PostgreSQL + PostGIS)
✅ Prisma Schema + Migrations
✅ CRUD Endpoints (Reports)
✅ Stats Endpoint
✅ Geocoding (OSM Nominatim)
✅ Rate Limiting + Validation
✅ Photo Upload Support
✅ Seed Data
✅ Tests Backend (91 testów - jednostkowe + integracyjne)
✅ Website Frontend (React + Vite + shadcn/ui)
✅ Admin Panel (React + Vite + Router)
✅ Tests Frontend (18 testów - components + utils)
✅ Build All Applications (successful)
✅ Full Integration Testing (API + DB working)

⏳ Production Deployment
⏳ E2E Tests (Playwright)
⏳ CI/CD Pipeline

## Troubleshooting

### Port 5432 zajęty?
```bash
# Zmień port w docker-compose.yml na 5433
# I zaktualizuj DATABASE_URL w .env
```

### Prisma Client błędy?
```bash
npm run db:generate
```

### Docker nie działa?
```bash
npm run docker:reset
```

## Licencja

TBD

## Kontakt

TBD
