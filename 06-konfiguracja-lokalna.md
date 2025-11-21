# Instrukcja Konfiguracji Środowiska Lokalnego

## 1. Wymagania Systemowe

### 1.1. Wymagane Oprogramowanie

- **Node.js**: v20.x LTS (recommended)
- **npm**: v10.x (included with Node.js)
- **Docker**: v24.x+
- **Docker Compose**: v2.x+
- **Git**: v2.x+
- **Code Editor**: VS Code (recommended) lub inny

### 1.2. Zalecane Rozszerzenia VS Code

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-azuretools.vscode-docker"
  ]
}
```

Zapisz to w `.vscode/extensions.json`

### 1.3. Sprawdzanie Wersji

```bash
# Node.js
node --version
# Powinno zwrócić: v20.x.x

# npm
npm --version
# Powinno zwrócić: v10.x.x

# Docker
docker --version
# Powinno zwrócić: Docker version 24.x.x+

# Docker Compose
docker compose version
# Powinno zwrócić: Docker Compose version v2.x.x+

# Git
git --version
# Powinno zwrócić: git version 2.x.x+
```

## 2. Instalacja Oprogramowania

### 2.1. Node.js (jeśli nie zainstalowany)

#### Windows
```bash
# Użyj instalatora z https://nodejs.org/
# Lub przez winget:
winget install OpenJS.NodeJS.LTS
```

#### macOS
```bash
# Przez Homebrew:
brew install node@20
```

#### Linux (Ubuntu/Debian)
```bash
# Przez NodeSource:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.2. Docker Desktop

#### Windows
1. Pobierz z https://www.docker.com/products/docker-desktop
2. Uruchom instalator
3. Po instalacji zrestartuj komputer
4. Uruchom Docker Desktop

#### macOS
```bash
# Przez Homebrew:
brew install --cask docker
```

#### Linux (Ubuntu/Debian)
```bash
# Instalacja Docker Engine:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Dodaj użytkownika do grupy docker:
sudo usermod -aG docker $USER
newgrp docker

# Instalacja Docker Compose:
sudo apt-get install docker-compose-plugin
```

## 3. Klonowanie Projektu

### 3.1. Clone Repository

```bash
# Clone projektu
git clone https://github.com/your-org/water-quality-reports.git

# Przejdź do katalogu projektu
cd water-quality-reports

# Sprawdź branch
git branch
# Powinno pokazać: * main lub * develop
```

### 3.2. Struktura Projektu

Po sklonowaniu powinieneś zobaczyć:
```
water-quality-reports/
├── app/
├── components/
├── lib/
├── prisma/
├── public/
├── config/
├── docs/
├── scripts/
├── tests/
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## 4. Konfiguracja Zmiennych Środowiskowych

### 4.1. Utworzenie Pliku .env.local

```bash
# Skopiuj przykładowy plik
cp config/environments/.env.local.example .env.local

# Edytuj plik
# Windows: notepad .env.local
# macOS/Linux: nano .env.local lub code .env.local
```

### 4.2. Konfiguracja .env.local

**Plik: `.env.local`**
```bash
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Docker)
DATABASE_URL=postgresql://waterreports:dev_password_123@localhost:5432/water_reports_dev

# Geocoding
PHOTON_URL=http://localhost:2322
NEXT_PUBLIC_MAPTILER_KEY=get_your_free_key_at_maptiler_com

# Redis (opcjonalne)
REDIS_URL=redis://localhost:6379

# File Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880  # 5MB w bajtach

# API Settings
RATE_LIMIT_WINDOW=60000  # 1 minuta w ms
RATE_LIMIT_MAX_REQUESTS=10

# Security (opcjonalne dla dev)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# Monitoring (opcjonalne)
SENTRY_DSN=
NEXT_PUBLIC_GA_ID=
```

### 4.3. Uzyskanie MapTiler API Key

MapTiler jest potrzebny do wyświetlania map. Aby uzyskać darmowy klucz:

1. Wejdź na https://www.maptiler.com/
2. Kliknij "Sign Up" (rejestracja)
3. Po zalogowaniu, przejdź do "Cloud" → "API Keys"
4. Skopiuj klucz i wklej do `.env.local`:
   ```bash
   NEXT_PUBLIC_MAPTILER_KEY=your_key_here
   ```

Darmowy plan oferuje 100,000 reqestów/miesiąc - wystarczające dla development.

## 5. Uruchomienie Docker Services

### 5.1. Start Docker Compose

```bash
# Uruchom wszystkie serwisy (PostgreSQL, Photon, Redis)
npm run docker:up

# To samo co:
# docker compose -f config/docker/docker-compose.yml up -d
```

**Oczekiwany output:**
```
[+] Running 4/4
 ✔ Network water-quality-reports_default    Created
 ✔ Container water-reports-db               Started
 ✔ Container water-reports-geocoder         Started
 ✔ Container water-reports-cache            Started
```

### 5.2. Weryfikacja Docker Services

```bash
# Sprawdź status kontenerów
docker ps

# Powinno pokazać 3 kontenery:
# - water-reports-db (PostgreSQL)
# - water-reports-geocoder (Photon)
# - water-reports-cache (Redis)
```

**Oczekiwany output:**
```
CONTAINER ID   IMAGE                    STATUS          PORTS
abc123         postgis/postgis:16-3.4   Up 2 minutes    0.0.0.0:5432->5432/tcp
def456         komoot/photon:latest     Up 2 minutes    0.0.0.0:2322->2322/tcp
ghi789         redis:7-alpine           Up 2 minutes    0.0.0.0:6379->6379/tcp
```

### 5.3. Sprawdzenie Logów

```bash
# Zobacz logi wszystkich kontenerów
npm run docker:logs

# Logi konkretnego kontenera
docker logs water-reports-db
docker logs water-reports-geocoder
docker logs water-reports-cache
```

### 5.4. Testowanie Połączeń

```bash
# Test PostgreSQL
docker exec -it water-reports-db psql -U waterreports -d water_reports_dev -c "SELECT version();"

# Test Photon (w przeglądarce lub curl)
curl http://localhost:2322/api?q=warszawa

# Test Redis
docker exec -it water-reports-cache redis-cli ping
# Powinno zwrócić: PONG
```

## 6. Instalacja Dependencies

### 6.1. Instalacja NPM Packages

```bash
# Instalacja wszystkich zależności
npm install

# Lub bardziej dokładnie (czysty install):
npm ci
```

**Oczekiwany output:**
```
added 500+ packages in 30s
```

**Uwaga**: Pierwszy `npm install` może zająć kilka minut.

### 6.2. Weryfikacja Instalacji

```bash
# Sprawdź czy wszystkie pakiety zostały zainstalowane
npm list --depth=0

# Sprawdź czy nie ma konfliktów
npm audit
```

## 7. Konfiguracja Bazy Danych

### 7.1. Generowanie Prisma Client

```bash
# Generuj Prisma Client na podstawie schema
npm run db:generate

# To samo co:
# npx prisma generate
```

### 7.2. Uruchomienie Migrations

```bash
# Uruchom migracje bazy danych
npm run db:migrate

# To samo co:
# npx prisma migrate dev
```

**Oczekiwany output:**
```
Environment variables loaded from .env.local
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "water_reports_dev"

Applying migration `20231119000000_init`

The following migration(s) have been applied:

migrations/
  └─ 20231119000000_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client
```

### 7.3. Seed Database (Opcjonalnie)

```bash
# Załaduj przykładowe dane
npm run db:seed

# To samo co:
# tsx prisma/seed.ts
```

**Oczekiwany output:**
```
Seeding database...
Created 10 sample reports
Database seeded successfully
```

### 7.4. Prisma Studio (Narzędzie do przeglądania bazy)

```bash
# Otwórz Prisma Studio
npm run db:studio

# Otwiera przeglądarkę na http://localhost:5555
```

W Prisma Studio możesz:
- Przeglądać wszystkie tabele
- Edytować rekordy
- Dodawać nowe rekordy
- Usuwać rekordy

## 8. Uruchomienie Aplikacji

### 8.1. Development Server

```bash
# Uruchom serwer deweloperski
npm run dev

# Aplikacja będzie dostępna pod:
# http://localhost:3000
```

**Oczekiwany output:**
```
   ▲ Next.js 14.0.3
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 2.5s
```

### 8.2. Weryfikacja Aplikacji

Otwórz przeglądarkę i przejdź do:

1. **Strona główna**: http://localhost:3000
   - Powinna wyświetlić się strona główna

2. **API Health Check**: http://localhost:3000/api/health
   - Powinno zwrócić: `{"status":"healthy",...}`

3. **API Reports**: http://localhost:3000/api/reports
   - Powinno zwrócić: `{"reports":[],"total":0}` (jeśli nie ma danych)
   - Lub listę zgłoszeń (jeśli uruchomiłeś seed)

4. **Mapa**: http://localhost:3000/mapa
   - Powinna wyświetlić się interaktywna mapa

### 8.3. Hot Reload

Next.js ma automatyczny hot reload. Po zapisaniu pliku, zmiany powinny być widoczne natychmiast w przeglądarce bez odświeżania.

## 9. Uruchomienie Testów

### 9.1. Linting

```bash
# Uruchom ESLint
npm run lint

# Napraw automatycznie co się da
npm run lint:fix
```

### 9.2. Type Checking

```bash
# Sprawdź typy TypeScript
npm run type-check
```

### 9.3. Unit Tests

```bash
# Uruchom unit tests
npm run test

# Uruchom z watch mode (automatyczne re-run)
npm run test:watch

# Generuj coverage report
npm run test:coverage
```

### 9.4. E2E Tests (Playwright)

```bash
# Najpierw zainstaluj Playwright browsers
npx playwright install

# Uruchom E2E tests
npm run test:e2e

# Uruchom z UI (interactive mode)
npm run test:e2e:ui
```

## 10. Narzędzia Deweloperskie

### 10.1. Code Formatting

```bash
# Formatuj cały kod przez Prettier
npm run format

# Sprawdź formatowanie (bez zmian)
npm run format:check
```

### 10.2. Database Reset

Jeśli chcesz zresetować bazę danych (usuwa wszystkie dane):

```bash
# UWAGA: To usunie wszystkie dane!
npm run db:reset

# Pytanie o potwierdzenie:
# ? Are you sure you want to reset your database? (y/N)
```

### 10.3. Docker Reset

Jeśli masz problemy z Docker services:

```bash
# Zatrzymaj i usuń kontenery + volumes
npm run docker:down
docker volume prune -f

# Uruchom ponownie
npm run docker:up

# Lub użyj skrótu:
npm run docker:reset
```

## 11. Troubleshooting

### 11.1. Problem: Port 3000 już zajęty

**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Rozwiązanie:**
```bash
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Lub zmień port w package.json:
"dev": "next dev -p 3001"
```

### 11.2. Problem: Port 5432 (PostgreSQL) zajęty

**Symptom:**
```
Error: port is already allocated
```

**Rozwiązanie:**

Opcja 1: Zatrzymaj lokalny PostgreSQL
```bash
# Windows:
net stop postgresql-x64-14

# macOS:
brew services stop postgresql

# Linux:
sudo systemctl stop postgresql
```

Opcja 2: Zmień port w `docker-compose.yml`
```yaml
services:
  postgres:
    ports:
      - "5433:5432"  # Użyj 5433 zamiast 5432
```

I zaktualizuj `.env.local`:
```bash
DATABASE_URL=postgresql://waterreports:dev_password_123@localhost:5433/water_reports_dev
```

### 11.3. Problem: Prisma Client nie generuje się

**Symptom:**
```
Error: Cannot find module '@prisma/client'
```

**Rozwiązanie:**
```bash
# Usuń node_modules i package-lock.json
rm -rf node_modules package-lock.json

# Reinstaluj
npm install

# Generuj Prisma Client
npm run db:generate
```

### 11.4. Problem: Migracje nie działają

**Symptom:**
```
Error: P1001: Can't reach database server
```

**Rozwiązanie:**
```bash
# 1. Sprawdź czy PostgreSQL działa
docker ps | grep water-reports-db

# 2. Sprawdź logi
docker logs water-reports-db

# 3. Sprawdź CONNECTION_URL w .env.local
# Powinno być: postgresql://waterreports:dev_password_123@localhost:5432/water_reports_dev

# 4. Test połączenia
docker exec -it water-reports-db psql -U waterreports -d water_reports_dev
```

### 11.5. Problem: MapTiler tiles nie ładują się

**Symptom:**
Mapa jest pusta lub pokazuje szare kafelki

**Rozwiązanie:**
```bash
# 1. Sprawdź czy NEXT_PUBLIC_MAPTILER_KEY jest w .env.local
cat .env.local | grep MAPTILER

# 2. Zweryfikuj klucz na https://cloud.maptiler.com/
# 3. Sprawdź limity (free tier: 100k requests/month)

# 4. Restart dev server
# Ctrl+C
npm run dev
```

### 11.6. Problem: Photon (geocoder) nie działa

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:2322
```

**Rozwiązanie:**
```bash
# 1. Sprawdź czy Photon działa
docker ps | grep water-reports-geocoder

# 2. Test API
curl http://localhost:2322/api?q=warszawa

# 3. Jeśli nie działa, restart kontenera
docker restart water-reports-geocoder

# 4. Sprawdź logi
docker logs water-reports-geocoder
```

### 11.7. Problem: Wysoka wykorzystanie CPU/Memory

**Symptom:**
Komputer działa wolno podczas development

**Rozwiązanie:**

Dla Docker Desktop (Windows/macOS):
1. Otwórz Docker Desktop → Settings
2. Resources → Ustaw:
   - CPUs: 2-4
   - Memory: 4-8 GB
   - Swap: 1 GB

Dla Linux:
```bash
# Ogranicz memory dla kontenerów
docker update --memory="2g" water-reports-db
docker update --memory="1g" water-reports-geocoder
docker update --memory="512m" water-reports-cache
```

### 11.8. Problem: Next.js build wolny

**Rozwiązanie:**
```bash
# Zwiększ Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run dev

# Lub dodaj do package.json:
"dev": "NODE_OPTIONS='--max_old_space_size=4096' next dev"
```

## 12. Kolejne Kroki

Po pomyślnej konfiguracji środowiska:

1. **Zapoznaj się z kodem**
   ```bash
   # Otwórz projekt w VS Code
   code .
   ```

2. **Przeczytaj dokumentację**
   - `docs/04-implementacja-frontend.md` - Plan implementacji frontend
   - `docs/05-implementacja-backend.md` - Plan implementacji backend

3. **Stwórz branch dla swojej pracy**
   ```bash
   git checkout -b feature/my-feature-name
   ```

4. **Zacznij development**
   - Frontend: Edytuj pliki w `app/` i `components/`
   - Backend: Edytuj pliki w `app/api/` i `lib/`

5. **Commituj regularnie**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-feature-name
   ```

## 13. Pomocne Komendy (Ściągawka)

```bash
# Uruchomienie środowiska
npm run docker:up          # Start Docker services
npm run dev                # Start dev server

# Baza danych
npm run db:generate        # Generuj Prisma Client
npm run db:migrate         # Uruchom migrations
npm run db:seed            # Załaduj przykładowe dane
npm run db:studio          # Otwórz Prisma Studio
npm run db:reset           # Reset bazy (usuwa dane!)

# Testing
npm run lint               # Linting
npm run type-check         # Type checking
npm run test               # Unit tests
npm run test:e2e           # E2E tests

# Docker
npm run docker:down        # Zatrzymaj kontenery
npm run docker:logs        # Zobacz logi
npm run docker:reset       # Reset Docker (usuwa volumes!)

# Inne
npm run format             # Formatuj kod
npm run build              # Build dla produkcji
```

## 14. Support i Pomoc

Jeśli napotkasz problemy:

1. **Sprawdź dokumentację** w folderze `docs/`
2. **Przeczytaj troubleshooting** (sekcja 11)
3. **Zobacz logi** (`npm run docker:logs`)
4. **Poszukaj w Issues** na GitHubie
5. **Zapytaj zespół** na Slack/Discord

---

**Dokument utworzony**: 2025-11-19  
**Wersja**: 1.0  
**Status**: Ready to use
