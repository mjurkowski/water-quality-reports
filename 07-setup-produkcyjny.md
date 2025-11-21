# Instrukcja Setup Środowiska Produkcyjnego

## 1. Przegląd

### 1.1. Infrastruktura Produkcyjna

**Hosting**: myDevil MD1 (Shared Hosting)

**Specyfikacja:**
- RAM: 1GB
- CPU: Shared (1 core equivalent)
- Storage: zgodnie z planem
- Node.js: Dostępny
- PostgreSQL 16: Dostępny
- SSL: Bezpłatny (Let's Encrypt)

**Ograniczenia:**
- Automatyczne wyłączanie procesów Node.js po 24h bezczynności
- Brak dostępu root
- Brak Docker
- Ograniczony dostęp do systemu plików

**Architektura:**
```
┌─────────────────────────────────────────┐
│         CloudFlare (opcjonalnie)        │
│            DNS + CDN + WAF              │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│           myDevil Hosting               │
├─────────────────────────────────────────┤
│  Express Server (PM2)                   │
│  ├── Static Files (Vite build)         │
│  │   └── React SPA                     │
│  ├── API Routes (/api/*)               │
│  │   ├── /api/reports                 │
│  │   ├── /api/stats                   │
│  │   └── /api/geocode                 │
│  └── /uploads/ (user uploads)          │
│                                         │
│  PostgreSQL 16 + PostGIS                │
│  └── Database                           │
│                                         │
│  Photon (Geocoding)                     │
│  └── Port 2322                          │
└─────────────────────────────────────────┘
```

### 1.2. Przygotowania

Przed rozpoczęciem setup'u upewnij się, że masz:

- [ ] Konto myDevil (aktywne)
- [ ] Zarejestrowaną domenę (np. cola-z-kranu.pl)
- [ ] Dostęp SSH do serwera
- [ ] Panel myDevil (devil.pl)
- [ ] MapTiler API key (production)
- [ ] GitHub repository setup
- [ ] Lokalnie działającą aplikację

## 2. Konfiguracja Hostingu myDevil

### 2.1. Panel myDevil - Podstawowa Konfiguracja

1. **Zaloguj się** do panelu myDevil: https://www.devil.pl/

2. **Utwórz domenę WWW**
   - Przejdź do: WWW → Dodaj domenę WWW
   - Domena: `cola-z-kranu.pl`
   - Katalog: `/domains/cola-z-kranu.pl/public_html`
   - SSL: Zaznacz "Let's Encrypt" (darmowy SSL)

3. **Ustaw Node.js**
   - Przejdź do: WWW → Node.js
   - Dodaj aplikację:
     - Domena: `cola-z-kranu.pl`
     - Wersja Node: 20.x LTS
     - Plik startowy: `server.js` (utworzymy później)

4. **Utwórz bazę danych PostgreSQL**
   - Przejdź do: Bazy danych → PostgreSQL
   - Kliknij "Dodaj bazę danych"
   - Nazwa: `m1234_waterreports` (m1234 to Twój numer konta)
   - Hasło: Wygeneruj silne hasło i zapisz je
   - Wersja: PostgreSQL 16

5. **Zainstaluj PostGIS extension**
   ```sql
   -- Zaloguj się do bazy przez phpPgAdmin w panelu
   -- Lub przez SSH:
   psql -U m1234_waterreports -d m1234_waterreports
   
   -- Włącz PostGIS:
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   
   -- Sprawdź instalację:
   SELECT PostGIS_version();
   ```

6. **Zapisz dane dostępowe**
   ```
   Database Host: mysql84.mydevil.net (lub inny)
   Database Port: 5432
   Database Name: m1234_waterreports
   Database User: m1234_waterreports
   Database Password: [twoje_hasło]
   
   SSH Host: s84.mydevil.net (lub inny)
   SSH User: m1234
   SSH Port: 22
   ```

### 2.2. Konfiguracja SSH

1. **Generuj klucz SSH** (jeśli nie masz)
   ```bash
   # Na swoim komputerze:
   ssh-keygen -t ed25519 -C "your_email@example.com"
   
   # Zapisz w: ~/.ssh/id_ed25519
   # Hasło: (opcjonalne, ale zalecane)
   ```

2. **Dodaj klucz publiczny do myDevil**
   ```bash
   # Wyświetl klucz publiczny:
   cat ~/.ssh/id_ed25519.pub
   
   # Skopiuj output
   ```
   
   - Wejdź do panelu myDevil
   - Przejdź do: SSH → Klucze SSH
   - Wklej klucz publiczny
   - Zapisz

3. **Test połączenia SSH**
   ```bash
   # Testowe połączenie:
   ssh m1234@s84.mydevil.net
   
   # Jeśli działa, wyjdź:
   exit
   ```

4. **Skonfiguruj SSH config** (opcjonalnie)
   ```bash
   # Edytuj ~/.ssh/config
   nano ~/.ssh/config
   ```
   
   ```
   Host mydevil
       HostName s84.mydevil.net
       User m1234
       Port 22
       IdentityFile ~/.ssh/id_ed25519
   ```
   
   Teraz możesz łączyć się przez: `ssh mydevil`

## 3. Przygotowanie Aplikacji do Produkcji

### 3.1. Konfiguracja Next.js dla Static Export

**Plik: `next.config.js`**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Ważne: static export dla shared hosting
  images: {
    unoptimized: true, // Required dla static export
  },
  trailingSlash: true, // Better compatibility z shared hosting
  
  // Environment variables dla buildu
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_MAPTILER_KEY: process.env.NEXT_PUBLIC_MAPTILER_KEY,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 3.2. Utworzenie Production Server (dla API Routes)

Next.js static export nie obsługuje API routes, więc potrzebujemy osobnego serwera Node.js.

**Plik: `server/index.js`** (nowy plik)
```javascript
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// Import API routes
require('./routes/reports')(app, prisma);
require('./routes/stats')(app, prisma);
require('./routes/geocode')(app);

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
```

**Plik: `server/routes/reports.js`**
```javascript
const { z } = require('zod');

module.exports = (app, prisma) => {
  // GET /api/reports
  app.get('/api/reports', async (req, res) => {
    try {
      // ... implementacja (skopiuj z app/api/reports/route.ts)
      res.json({ reports: [], total: 0 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/reports
  app.post('/api/reports', async (req, res) => {
    try {
      // ... implementacja
      res.status(201).json({ id: 'uuid', message: 'Created' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ... pozostałe endpointy
};
```

### 3.3. Package.json - Production Scripts

```json
{
  "scripts": {
    "build": "next build",
    "start:api": "node server/index.js",
    "deploy": "npm run build && npm run deploy:files && npm run deploy:api",
    "deploy:files": "rsync -avz --delete -e 'ssh -p 22' ./out/ m1234@s84.mydevil.net:/home/m1234/domains/cola-z-kranu.pl/public_html/",
    "deploy:api": "rsync -avz -e 'ssh -p 22' ./server/ m1234@s84.mydevil.net:/home/m1234/api/",
    "pm2:start": "pm2 start server/index.js --name water-reports-api",
    "pm2:restart": "pm2 restart water-reports-api",
    "pm2:stop": "pm2 stop water-reports-api",
    "pm2:logs": "pm2 logs water-reports-api"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@prisma/client": "^5.7.0"
  }
}
```

### 3.4. Environment Variables dla Produkcji

**Plik: `.env.production`** (nie commituj do Git!)
```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://cola-z-kranu.pl
PORT=3001

# Database (myDevil)
DATABASE_URL=postgresql://m1234_waterreports:TWOJE_HASLO@mysql84.mydevil.net:5432/m1234_waterreports

# Geocoding
PHOTON_URL=http://localhost:2322
NEXT_PUBLIC_MAPTILER_KEY=production_key_here

# File Upload
UPLOAD_DIR=/home/m1234/domains/cola-z-kranu.pl/public_html/uploads
MAX_FILE_SIZE=5242880

# API Settings
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=10

# Security
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=production_site_key
RECAPTCHA_SECRET_KEY=production_secret_key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 4. Deployment - Krok po Kroku

### 4.1. Pre-Deployment Checklist

```bash
# Na swoim komputerze:

# 1. Pull latest code
git checkout main
git pull origin main

# 2. Run tests
npm run test
npm run lint
npm run type-check

# 3. Build lokalnie (test)
npm run build

# 4. Sprawdź build size
du -sh out/

# 5. Test production build lokalnie
npx serve out -p 8080
# Otwórz http://localhost:8080 i sprawdź
```

### 4.2. Pierwszy Deploy - Setup Serwera

**Krok 1: Połącz się przez SSH**
```bash
ssh m1234@s84.mydevil.net
# Lub: ssh mydevil (jeśli masz SSH config)
```

**Krok 2: Przygotuj strukturę katalogów**
```bash
# Utwórz katalogi
mkdir -p ~/domains/cola-z-kranu.pl/public_html
mkdir -p ~/api
mkdir -p ~/backups/database

# Sprawdź strukturę
ls -la ~/domains/cola-z-kranu.pl/
```

**Krok 3: Zainstaluj PM2 (Process Manager)**
```bash
# PM2 będzie zarządzał procesem Node.js
npm install -g pm2

# Sprawdź instalację
pm2 --version
```

**Krok 4: Setup Photon (Geocoder)**
```bash
# Photon musi być uruchomiony lokalnie
# Na myDevil może nie być dostępny Docker, więc używamy binarki

cd ~/
wget https://github.com/komoot/photon/releases/download/0.4.0/photon-0.4.0.jar

# Pobierz dane dla Polski (opcjonalnie, może być duży)
# wget https://download1.graphhopper.com/public/extracts/by-country-code/pl/poland-latest.osm.pbf

# Start Photon (w tle)
nohup java -jar photon-0.4.0.jar &

# Sprawdź czy działa
curl http://localhost:2322/api?q=warszawa
```

**Krok 5: Wyjdź z SSH**
```bash
exit
```

### 4.3. Deploy Aplikacji

**Z lokalnego komputera:**

**Krok 1: Build aplikacji**
```bash
# Ustaw production env vars
export NEXT_PUBLIC_APP_URL=https://cola-z-kranu.pl
export NEXT_PUBLIC_MAPTILER_KEY=your_production_key

# Build
npm run build

# Sprawdź output
ls -la out/
```

**Krok 2: Deploy static files (Frontend)**
```bash
# Sync plików do serwera
rsync -avz --delete \
  -e "ssh -p 22" \
  ./out/ \
  m1234@s84.mydevil.net:/home/m1234/domains/cola-z-kranu.pl/public_html/

# Oczekiwany output:
# sending incremental file list
# ./
# index.html
# _next/...
# sent X bytes  received Y bytes
```

**Krok 3: Deploy API server (Backend)**
```bash
# Sync server files
rsync -avz \
  -e "ssh -p 22" \
  --exclude 'node_modules' \
  ./server/ \
  m1234@s84.mydevil.net:/home/m1234/api/

# Sync package.json
rsync -avz \
  -e "ssh -p 22" \
  ./package.json ./package-lock.json \
  m1234@s84.mydevil.net:/home/m1234/api/
```

**Krok 4: Deploy Prisma**
```bash
# Sync Prisma schema i migrations
rsync -avz \
  -e "ssh -p 22" \
  ./prisma/ \
  m1234@s84.mydevil.net:/home/m1234/api/prisma/
```

**Krok 5: SSH i finalizacja**
```bash
# Połącz się z serwerem
ssh m1234@s84.mydevil.net

# Przejdź do katalogu API
cd ~/api

# Utwórz .env.production
nano .env.production
# Wklej zmienne środowiskowe z sekcji 3.4

# Instaluj dependencies
npm ci --production

# Generuj Prisma Client
npx prisma generate

# Uruchom migrations
npx prisma migrate deploy

# Start API server przez PM2
pm2 start server/index.js --name water-reports-api

# Sprawdź status
pm2 status

# Zobacz logi
pm2 logs water-reports-api

# Save PM2 configuration (auto-restart po reboot)
pm2 save
pm2 startup
```

### 4.4. Konfiguracja Nginx (jeśli potrzebna)

myDevil może wymagać konfiguracji Nginx dla routingu API requests.

**Plik: `~/domains/cola-z-kranu.pl/.nginx.conf`**
```nginx
location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

Reload Nginx:
```bash
# W panelu myDevil lub przez SSH:
devil www reload cola-z-kranu.pl
```

### 4.5. Weryfikacja Deployment

**Test endpoints:**
```bash
# Health check
curl https://cola-z-kranu.pl/api/health

# Should return: {"status":"healthy",...}

# Reports endpoint
curl https://cola-z-kranu.pl/api/reports

# Should return: {"reports":[],"total":0}
```

**Otwórz w przeglądarce:**
1. https://cola-z-kranu.pl - strona główna
2. https://cola-z-kranu.pl/mapa - mapa
3. https://cola-z-kranu.pl/zglos - formularz

## 5. Backup Strategy

### 5.1. Automatyczny Backup Bazy Danych

**Plik: `~/scripts/backup-db.sh`** (na serwerze)
```bash
#!/bin/bash

BACKUP_DIR="$HOME/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

mkdir -p "$BACKUP_DIR"

# Create backup
pg_dump -h mysql84.mydevil.net \
  -U m1234_waterreports \
  -d m1234_waterreports \
  -F c \
  -f "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"

# Keep only last 7 daily backups
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

**Ustaw cron job:**
```bash
# Edytuj crontab
crontab -e

# Dodaj (backup codziennie o 2:00)
0 2 * * * /home/m1234/scripts/backup-db.sh >> /home/m1234/logs/backup.log 2>&1
```

### 5.2. Backup Plików (Uploads)

```bash
#!/bin/bash
# ~/scripts/backup-files.sh

BACKUP_DIR="$HOME/backups/uploads"
DATE=$(date +%Y%m%d)
UPLOAD_DIR="$HOME/domains/cola-z-kranu.pl/public_html/uploads"

mkdir -p "$BACKUP_DIR"

# Sync uploads
rsync -av "$UPLOAD_DIR/" "$BACKUP_DIR/uploads_$DATE/"

# Keep only last 30 days
find "$BACKUP_DIR" -name "uploads_*" -mtime +30 -exec rm -rf {} \;
```

### 5.3. Remote Backup (opcjonalnie)

Backup na zewnętrzny serwer lub cloud storage:

```bash
# Sync backups do AWS S3 (przykład)
aws s3 sync ~/backups/ s3://your-bucket/backups/ --delete

# Lub do innego serwera przez rsync
rsync -avz ~/backups/ backup-server:/backups/water-reports/
```

## 6. Monitoring

### 6.1. Uptime Monitoring

**UptimeRobot** (darmowy)

1. Zarejestruj się na https://uptimerobot.com
2. Dodaj monitor:
   - Type: HTTP(s)
   - URL: https://cola-z-kranu.pl
   - Interval: 5 minutes
3. Dodaj alerting:
   - Email notification
   - SMS (opcjonalnie, płatne)

### 6.2. Error Logging - Sentry (opcjonalnie)

**Setup Sentry:**

1. Zarejestruj się na https://sentry.io
2. Utwórz nowy projekt (Next.js)
3. Skopiuj DSN
4. Dodaj do `.env.production`:
   ```bash
   SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

**Plik: `lib/sentry.ts`**
```typescript
import * as Sentry from '@sentry/nextjs';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}
```

### 6.3. Application Logs

**PM2 logs:**
```bash
# Zobacz logi
pm2 logs water-reports-api

# Save logs do pliku
pm2 logs water-reports-api --lines 1000 > ~/logs/api-$(date +%Y%m%d).log

# Automatyczne rotowanie logów
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 6.4. Database Monitoring

**Plik: `~/scripts/check-db-size.sh`**
```bash
#!/bin/bash

# Check database size
psql -h mysql84.mydevil.net \
  -U m1234_waterreports \
  -d m1234_waterreports \
  -c "SELECT pg_size_pretty(pg_database_size('m1234_waterreports'));"

# Check table sizes
psql -h mysql84.mydevil.net \
  -U m1234_waterreports \
  -d m1234_waterreports \
  -c "SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

## 7. Maintenance

### 7.1. Rutynowe Zadania

**Codziennie (automatyczne):**
- [ ] Backup bazy danych (cron)
- [ ] Log rotation (pm2-logrotate)

**Co tydzień:**
- [ ] Sprawdź logi błędów
- [ ] Sprawdź wykorzystanie dysku
- [ ] Sprawdź uptime monitoring

**Co miesiąc:**
- [ ] Aktualizacja dependencies (`npm audit fix`)
- [ ] Przegląd backupów (test restore)
- [ ] Performance review (Lighthouse)
- [ ] Security audit

### 7.2. Update Dependencies

```bash
# Na lokalnym komputerze:

# Check for updates
npm outdated

# Update minor/patch versions
npm update

# Update to latest versions (carefully!)
npm install package-name@latest

# Test locally
npm run test
npm run build

# Deploy
# (follow section 4.3)
```

### 7.3. Database Maintenance

```sql
-- Vacuum database (reclaim space)
VACUUM ANALYZE;

-- Reindex
REINDEX DATABASE m1234_waterreports;

-- Check database stats
SELECT 
  schemaname,
  tablename,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows
FROM pg_stat_user_tables;
```

## 8. Troubleshooting Production

### 8.1. Problem: Strona nie ładuje się

**Diagnoza:**
```bash
# SSH do serwera
ssh m1234@s84.mydevil.net

# Sprawdź czy pliki istnieją
ls -la ~/domains/cola-z-kranu.pl/public_html/

# Sprawdź permissions
chmod -R 755 ~/domains/cola-z-kranu.pl/public_html/

# Sprawdź logi Nginx
tail -f ~/domains/cola-z-kranu.pl/logs/error.log
```

### 8.2. Problem: API nie odpowiada

**Diagnoza:**
```bash
# Sprawdź PM2 status
pm2 status

# Jeśli zatrzymany, restart:
pm2 restart water-reports-api

# Zobacz logi
pm2 logs water-reports-api --lines 100

# Test API lokalnie na serwerze
curl http://localhost:3001/api/health
```

### 8.3. Problem: Błędy bazy danych

**Diagnoza:**
```bash
# Test połączenia
psql -h mysql84.mydevil.net -U m1234_waterreports -d m1234_waterreports

# Sprawdź active connections
SELECT count(*) FROM pg_stat_activity;

# Sprawdź long-running queries
SELECT pid, now() - query_start as duration, query 
FROM pg_stat_activity 
WHERE state = 'active' 
ORDER BY duration DESC;
```

### 8.4. Problem: Wolne zapytania

**Optymalizacja:**
```sql
-- Analyze query performance
EXPLAIN ANALYZE 
SELECT * FROM "Report" 
WHERE status = 'active' 
LIMIT 100;

-- Check missing indexes
SELECT 
  schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY abs(correlation) DESC;
```

### 8.5. Problem: Pełny dysk

**Diagnoza:**
```bash
# Sprawdź wykorzystanie dysku
df -h

# Znajdź największe pliki
du -sh ~/* | sort -h

# Wyczyść stare logi
find ~/logs -name "*.log" -mtime +30 -delete

# Wyczyść stare backupy
find ~/backups -mtime +60 -delete
```

## 9. CI/CD - GitHub Actions

### 9.1. Workflow Deployment (Trigger on Git Tag)

Deployment powinien być triggered przez push git tag, a nie push do brancha. To zapewnia kontrolę nad tym, kiedy kod trafia na produkcję.

**Plik: `.github/workflows/deploy-production.yml`**
```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*.*.*'  # Trigger on version tags (e.g., v1.0.0, v1.2.3)

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linters
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build applications
        run: npm run build
        env:
          # Website build env vars
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_MAPTILER_KEY: ${{ secrets.VITE_MAPTILER_KEY }}

      - name: Generate OpenAPI specification
        run: npm run openapi:generate

      - name: Generate API clients
        run: npm run openapi:generate-client

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.SSH_PRIVATE_KEY }}

      - name: Add server to known hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H s84.mydevil.net >> ~/.ssh/known_hosts

      - name: Deploy website
        run: |
          rsync -avz --delete \
            -e "ssh -o StrictHostKeyChecking=no" \
            ./website/dist/ \
            ${{ secrets.SSH_USER }}@s84.mydevil.net:/home/${{ secrets.SSH_USER }}/domains/cola-z-kranu.pl/public_html/

      - name: Deploy admin panel
        run: |
          rsync -avz --delete \
            -e "ssh -o StrictHostKeyChecking=no" \
            ./admin/dist/ \
            ${{ secrets.SSH_USER }}@s84.mydevil.net:/home/${{ secrets.SSH_USER }}/domains/admin.cola-z-kranu.pl/public_html/

      - name: Deploy API
        run: |
          rsync -avz --delete \
            -e "ssh -o StrictHostKeyChecking=no" \
            --exclude 'node_modules' \
            --exclude '.env' \
            --exclude 'uploads' \
            ./api/dist/ \
            ./api/package.json \
            ./api/package-lock.json \
            ./api/prisma/ \
            ./api/ecosystem.config.js \
            ${{ secrets.SSH_USER }}@s84.mydevil.net:/home/${{ secrets.SSH_USER }}/api/

      - name: Install production dependencies
        run: |
          ssh ${{ secrets.SSH_USER }}@s84.mydevil.net << 'ENDSSH'
            cd ~/api
            npm ci --omit=dev
          ENDSSH

      - name: Run database migrations
        run: |
          ssh ${{ secrets.SSH_USER }}@s84.mydevil.net << 'ENDSSH'
            cd ~/api
            npx prisma migrate deploy
          ENDSSH

      - name: Restart API with PM2
        run: |
          ssh ${{ secrets.SSH_USER }}@s84.mydevil.net << 'ENDSSH'
            cd ~/api
            pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js
          ENDSSH

      - name: Health check
        run: |
          sleep 10
          curl -f https://cola-z-kranu.pl/api/health || exit 1

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

### 9.2. Konfiguracja GitHub Secrets

W repository settings → Secrets and variables → Actions, dodaj następujące secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `SSH_PRIVATE_KEY` | Klucz prywatny SSH do serwera | `-----BEGIN OPENSSH PRIVATE KEY-----\n...` |
| `SSH_USER` | Username na myDevil | `m1234` |
| `VITE_API_URL` | Production API URL | `https://cola-z-kranu.pl/api` |
| `VITE_MAPTILER_KEY` | MapTiler API key (production) | `your_maptiler_key` |

### 9.3. Proces Wydawania Nowej Wersji

**Krok 1: Przygotuj release lokalnie**
```bash
# Zaktualizuj CHANGELOG.md
vim CHANGELOG.md

# Upewnij się że wszystko jest commitowane
git add .
git commit -m "Prepare release v1.2.3"

# Wypchnij zmiany
git push origin main
```

**Krok 2: Utwórz i wypchnij tag**
```bash
# Utwórz annotated tag
git tag -a v1.2.3 -m "Release version 1.2.3

Changes:
- Added multi-photo upload support
- Improved map clustering
- Fixed geocoding issues
"

# Wypchnij tag do GitHub (to uruchomi deployment!)
git push origin v1.2.3
```

**Krok 3: Monitoruj deployment**
- Przejdź do GitHub → Actions
- Zobacz workflow "Deploy to Production"
- Sprawdź logi każdego kroku
- Po zakończeniu sprawdź aplikację: https://cola-z-kranu.pl

**Krok 4: Weryfikacja**
```bash
# Sprawdź health endpoint
curl https://cola-z-kranu.pl/api/health

# Sprawdź PM2 status na serwerze
ssh m1234@s84.mydevil.net "pm2 status"

# Zobacz logi
ssh m1234@s84.mydevil.net "pm2 logs water-reports-api --lines 50"
```

### 9.4. Rollback (jeśli coś pójdzie nie tak)

**Opcja 1: Rollback do poprzedniego taga**
```bash
# Znajdź poprzedni tag
git tag -l

# Wypchnij poprzedni tag (wymusi re-deployment)
git push origin v1.2.2 -f

# Lub utwórz nowy tag z poprzedniego commitu
git tag -a v1.2.4 <poprzedni-commit-sha> -m "Rollback to stable version"
git push origin v1.2.4
```

**Opcja 2: Rollback manualny na serwerze**
```bash
# SSH do serwera
ssh m1234@s84.mydevil.net

# Przywróć poprzedni backup (jeśli istnieje)
cd ~/backups
cp -r backup_20250119_123000/api/* ~/api/

# Restart PM2
cd ~/api
pm2 restart ecosystem.config.js
```

### 9.5. CI Workflow (Continuous Integration)

**Plik: `.github/workflows/ci.yml`**
```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linters
        run: npm run lint

      - name: Run type check
        run: npm run build  # TypeScript check podczas buildu

      - name: Run tests
        run: npm run test
```

## 10. Security Checklist

### 9.1. Production Security

- [ ] SSL/HTTPS włączony (Let's Encrypt)
- [ ] Security headers skonfigurowane
- [ ] Rate limiting aktywny
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection (sanitization)
- [ ] CSRF protection
- [ ] Strong database password
- [ ] SSH key authentication (not password)
- [ ] Fail2ban installed (optional)
- [ ] Regular security updates

### 9.2. RODO Compliance

- [ ] Privacy Policy published
- [ ] Cookie consent (if using cookies)
- [ ] Data retention policy
- [ ] User data deletion process
- [ ] Contact email for data requests

## 10. Performance Optimization

### 10.1. Frontend Optimization

- [ ] Images optimized (WebP, compression)
- [ ] Lazy loading implemented
- [ ] Code splitting
- [ ] Minification (automatic in Next.js)
- [ ] Gzip/Brotli compression

### 10.2. Backend Optimization

- [ ] Database indexes
- [ ] Query optimization
- [ ] Connection pooling
- [ ] Caching (Redis if available)
- [ ] API response compression

### 10.3. CDN (opcjonalnie)

**CloudFlare (darmowy plan):**

1. Dodaj domenę do CloudFlare
2. Zmień nameservery u rejestratora
3. Włącz:
   - Auto Minify (CSS, JS, HTML)
   - Brotli compression
   - Caching (aggressive)
   - Always Use HTTPS

## 11. Helpful Commands Cheatsheet

```bash
# SSH
ssh m1234@s84.mydevil.net

# PM2
pm2 status
pm2 restart water-reports-api
pm2 logs water-reports-api
pm2 monit

# Database
psql -h mysql84.mydevil.net -U m1234_waterreports -d m1234_waterreports

# Disk usage
df -h
du -sh ~/*

# Find large files
find ~ -type f -size +100M

# Nginx
devil www reload cola-z-kranu.pl

# Cron
crontab -l  # List
crontab -e  # Edit
```

---

**Dokument utworzony**: 2025-11-19  
**Wersja**: 1.0  
**Status**: Production Ready
