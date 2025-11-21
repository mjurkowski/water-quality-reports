# Założenia i Specyfikacja Projektu - Serwis Zgłaszania Problemów z Wodą

## 1. Wprowadzenie

### 1.1. Cel Projektu
Stworzenie serwisu internetowego umożliwiającego obywatelom zgłaszanie problemów z jakością wody w Polsce. System pozwala na:
- Zgłaszanie problemów z wodą (brunatna woda, nieczysta woda, zła jakość)
- Wizualizację zgłoszeń na mapie
- Przeglądanie statystyk i trendów
- Informowanie społeczności o problemach w ich okolicy

### 1.2. Nazwa Projektu
**"Cola z Kranu"**

### 1.3. Grupa Docelowa
- Mieszkańcy Polski doświadczający problemów z wodą
- Organizacje społeczne monitorujące jakość wody
- Media zainteresowane tematyką ekologiczną
- Władze lokalne

## 2. Wymagania Funkcjonalne

### 2.1. Moduł Zgłoszeń
- **F1.1** Formularz zgłoszenia problemu z polami:
  - Typ problemu (checkbox: może być wiele typów jednocześnie)
    - Brunatna woda
    - Nieprzyjemny zapach
    - Osad/zawiesiny
    - Niskie ciśnienie
    - Brak wody
    - Inne
  - Lokalizacja (wskazanie na mapie obowiązkowe)
  - Zdjęcia (opcjonalne, maksymalnie 5 zdjęć)
  - Opis problemu (opcjonalny)
  - Data wystąpienia
  - Kontakt (opcjonalny, e-mail)
- **F1.2** Walidacja zgłoszeń przed zapisem
- **F1.3** Automatyczne przypisanie współrzędnych geograficznych
- **F1.4** Możliwość zgłoszenia do usunięcia (zgłoszenie do administratora, nie bezpośrednie usunięcie)

### 2.2. Moduł Mapy
- **F2.1** Interaktywna mapa z inteligentnym ładowaniem danych:
  - Widok całej Polski: sklasteryzowane punkty z agregowaną liczbą zgłoszeń
  - Przybliżenie do regionu: ładowanie szczegółowych zgłoszeń
  - Marker clustering (Leaflet.markercluster) dla grupowania bliskich punktów
- **F2.2** Filtry:
  - Typ problemu (wielokrotny wybór)
  - Zakres dat
  - Obszar geograficzny
- **F2.3** Wyświetlanie szczegółów zgłoszenia po kliknięciu (modal/sidebar)
- **F2.4** Wyszukiwarka adresów/lokalizacji (Photon geocoding)
- **F2.5** Geolokalizacja użytkownika (za zgodą)

### 2.3. Moduł Statystyk
- **F3.1** Statystyki globalne:
  - Liczba zgłoszeń (ogółem, ostatni miesiąc, ostatni tydzień)
  - Najpopularniejsze typy problemów
  - Najbardziej dotknięte regiony
- **F3.2** Wykresy i wizualizacje trendów
- **F3.3** Export danych do CSV (dla mediów/badaczy)

### 2.4. Moduł Informacyjny
- **F4.1** Strona główna z opisem projektu
- **F4.2** Instrukcje jak zgłosić problem
- **F4.3** FAQ
- **F4.4** Polityka prywatności i RODO
- **F4.5** Kontakt

## 3. Wymagania Niefunkcjonalne

### 3.1. Wydajność
- **NF1.1** Czas ładowania strony głównej: < 2s
- **NF1.2** Czas odpowiedzi API: < 500ms (95 percentyl)
- **NF1.3** Obsługa do 10,000 zgłoszeń bez degradacji wydajności
- **NF1.4** Obsługa do 100 równoczesnych użytkowników

### 3.2. Bezpieczeństwo
- **NF2.1** HTTPS dla całej komunikacji
- **NF2.2** Walidacja i sanityzacja wszystkich danych wejściowych
- **NF2.3** Rate limiting dla API (10 req/min na IP)
- **NF2.4** Ochrona przed SQL injection, XSS, CSRF
- **NF2.5** Hashowanie wrażliwych danych (jeśli dotyczy)

### 3.3. Dostępność
- **NF3.1** Dostępność: 99.5% (dopuszczalny downtime: ~3.6h/miesiąc)
- **NF3.2** Responsive design (desktop, tablet, mobile)
- **NF3.3** Wsparcie dla przeglądarek: Chrome, Firefox, Safari, Edge (ostatnie 2 wersje)
- **NF3.4** Podstawowe wsparcie dla WCAG 2.1 Level A

### 3.4. SEO
- **NF4.1** Static Site Generation dla stron publicznych
- **NF4.2** Semantyczne znaczniki HTML
- **NF4.3** Open Graph i Twitter Cards
- **NF4.4** Sitemap XML i robots.txt
- **NF4.5** Meta description i title dla każdej strony

### 3.5. Skalowalność
- **NF5.1** Architektura umożliwiająca migrację na dedykowany serwer
- **NF5.2** Kod przygotowany na horizontal scaling
- **NF5.3** Optymalizacja zapytań bazodanowych z indeksami

## 4. Architektura Techniczna

### 4.1. Stack Technologiczny

#### Frontend
- **Framework**: React 18+ z Vite
- **Język**: TypeScript
- **Styling**: shadcn/ui + Tailwind CSS
- **Mapy**: Leaflet + Leaflet.markercluster + MapTiler
- **Build Tool**: Vite
- **Formularze**: React Hook Form + Zod
- **State Management**: Redux Toolkit (RTK)
- **API Client**: RTK Query + OpenAPI TypeScript code generation
- **Routing**: React Router v6 (admin panel), one-pager (website)

#### Backend
- **Runtime**: Node.js 20+ LTS
- **Framework**: Express.js
- **API Documentation**: OpenAPI 3.0 (automatyczna generacja specyfikacji)
- **Baza danych**: PostgreSQL 16 + PostGIS
- **ORM**: Prisma
- **Walidacja**: Zod (wspólne schematy dla frontend/backend)
- **Upload plików**: Multer + lokalny filesystem (max 5 zdjęć po 5MB)
- **CORS**: cors middleware
- **Security**: helmet, express-rate-limit

#### Infrastructure
- **Hosting**: myDevil MD1 (shared hosting)
- **Deploy**:
  - Frontend: Vite build → static files
  - Backend: Express server (PM2 process manager)
  - Frontend serwowany przez Express (static middleware)
- **Database**: PostgreSQL z PostGIS
- **Geocoding**: Photon (self-hosted na tym samym serwerze)
- **CI/CD**: GitHub Actions
- **Monitoring**: (opcjonalnie) Sentry, Uptime Robot

### 4.2. Schemat Bazy Danych

#### Tabela: reports
```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'brown_water', 'bad_smell', 'sediment', 'other'
    description TEXT,
    location GEOMETRY(POINT, 4326) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    voivodeship VARCHAR(50),
    postal_code VARCHAR(10),
    photo_url VARCHAR(500),
    contact_email VARCHAR(255),
    reported_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'active' -- 'active', 'deleted', 'spam'
);

CREATE INDEX idx_reports_location ON reports USING GIST (location);
CREATE INDEX idx_reports_type ON reports (type);
CREATE INDEX idx_reports_reported_at ON reports (reported_at);
CREATE INDEX idx_reports_created_at ON reports (created_at);
CREATE INDEX idx_reports_city ON reports (city);
```

### 4.3. API Endpoints

#### POST /api/reports
Utworzenie nowego zgłoszenia
```typescript
Request Body:
{
  type: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  photoBase64?: string;
  contactEmail?: string;
  reportedAt: string; // ISO date
}

Response: 201 Created
{
  id: string; // UUID
  message: string;
}
```

#### GET /api/reports
Pobranie listy zgłoszeń z filtrowaniem
```typescript
Query params:
- bounds: string (format: "minLat,minLng,maxLat,maxLng")
- type: string[]
- startDate: string (ISO)
- endDate: string (ISO)
- limit: number (default: 1000)

Response: 200 OK
{
  reports: Array<{
    id: string;
    type: string;
    description: string;
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    photoUrl?: string;
    reportedAt: string;
    createdAt: string;
  }>;
  total: number;
}
```

#### GET /api/reports/[uuid]
Pobranie szczegółów zgłoszenia
```typescript
Response: 200 OK
{
  id: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  voivodeship: string;
  photoUrl?: string;
  reportedAt: string;
  createdAt: string;
}
```

#### DELETE /api/reports/[uuid]
Usunięcie zgłoszenia (tylko w ciągu 24h po utworzeniu)
```typescript
Headers:
- X-Delete-Token: string (token wygenerowany przy tworzeniu)

Response: 204 No Content
```

#### GET /api/stats
Pobranie statystyk
```typescript
Query params:
- period: string ('week' | 'month' | 'year' | 'all')

Response: 200 OK
{
  total: number;
  byType: Record<string, number>;
  byVoivodeship: Record<string, number>;
  byMonth: Array<{ month: string; count: number }>;
}
```

## 5. Strategia Testowania

### 5.1. Poziomy Testowania

#### 5.1.1. Unit Tests
- **Zakres**: Funkcje utility, walidatory, helpery
- **Framework**: Jest + Testing Library
- **Cel pokrycia**: > 80% critical paths
- **Przykłady**:
  - Walidacja formularzy (Zod schemas)
  - Formatowanie danych
  - Parsowanie współrzędnych

#### 5.1.2. Integration Tests
- **Zakres**: API endpoints, Database queries
- **Framework**: Jest + Supertest
- **Setup**: Test database (PostgreSQL in Docker)
- **Przykłady**:
  - POST /api/reports utworzy rekord w bazie
  - GET /api/reports zwróci poprawnie przefiltrowane dane
  - Rate limiting działa poprawnie

#### 5.1.3. E2E Tests
- **Zakres**: Kluczowe user flows
- **Framework**: Playwright
- **Środowisko**: Staging/Pre-production
- **Przykłady**:
  - Użytkownik może zgłosić problem
  - Mapa wyświetla zgłoszenia
  - Filtry działają poprawnie

#### 5.1.4. Manual Testing
- **Zakres**: UI/UX, dostępność, cross-browser
- **Częstotliwość**: Przed każdym release
- **Checklist**:
  - Responsive design na różnych urządzeniach
  - Funkcjonalność w różnych przeglądarkach
  - Dostępność (screen reader)

### 5.2. Automatyzacja Testów

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgis/postgis:16-3.4
        env:
          POSTGRES_PASSWORD: test
    steps:
      - Checkout code
      - Setup Node.js
      - Install dependencies
      - Run linting (ESLint)
      - Run type checking (TypeScript)
      - Run unit tests
      - Run integration tests
      - Upload coverage reports
```

### 5.3. Test Checklist przed Release

- [ ] Wszystkie testy jednostkowe przechodzą
- [ ] Wszystkie testy integracyjne przechodzą
- [ ] Testy E2E na staging środowisku przeszły
- [ ] Manual testing na produkcyjnym build'zie
- [ ] Performance testing (Lighthouse score > 90)
- [ ] Security scan (npm audit, Snyk)
- [ ] Database migrations przetestowane
- [ ] Backup bazy danych wykonany

## 6. Strategia Wydawania (Release Strategy)

### 6.1. Wersjonowanie
- **Semantic Versioning**: MAJOR.MINOR.PATCH
  - MAJOR: Breaking changes
  - MINOR: Nowe funkcje (backward compatible)
  - PATCH: Bug fixes
- **Git Tags**: v1.0.0, v1.1.0, etc.
- **Release Branches**: release/v1.0.0

### 6.2. Środowiska

#### Development (Local)
- **URL**: http://localhost:3000
- **Database**: PostgreSQL w Docker
- **Purpose**: Rozwój i debugowanie

#### Staging (Opcjonalne)
- **URL**: https://staging.projekt.pl
- **Database**: Kopia produkcyjnej bazy (anonymized)
- **Purpose**: Final testing przed production

#### Production
- **URL**: https://cola-z-kranu.pl (przykład)
- **Database**: PostgreSQL na myDevil
- **Purpose**: Live application

### 6.3. Proces Wydawania

#### 6.3.1. Pre-release Checklist
1. Zaktualizuj CHANGELOG.md
2. Sprawdź wszystkie testy
3. Code review dla wszystkich PR
4. Zaktualizuj wersję w package.json
5. Utwórz git tag
6. Zbuduj production build lokalnie i przetestuj

#### 6.3.2. Release Steps
```bash
# 1. Przygotowanie release
git checkout main
git pull origin main
npm run test
npm run build

# 2. Bump version
npm version minor -m "Release v%s"

# 3. Push tags
git push origin main --tags

# 4. Deploy (automated via GitHub Actions)
# Workflow automatycznie:
# - Buduje aplikację
# - Uruchamia testy
# - Deployuje na serwer via FTP/SSH
```

#### 6.3.3. Post-release Checklist
- [ ] Weryfikacja działania na produkcji
- [ ] Sprawdzenie logów (brak krytycznych błędów)
- [ ] Monitoring metryk (response times, error rate)
- [ ] Aktualizacja dokumentacji
- [ ] Komunikat o nowej wersji (jeśli dotyczy)

### 6.4. Rollback Strategy
W przypadku krytycznego błędu na produkcji:

1. **Natychmiastowy rollback**:
   ```bash
   # Powrót do poprzedniego taga
   git checkout v1.0.0
   npm run build
   # Deploy poprzedniej wersji
   ```

2. **Database rollback** (jeśli dotyczy):
   ```bash
   # Przywrócenie z backupu
   psql -U username -d database < backup_before_v1.1.0.sql
   ```

3. **Komunikacja**:
   - Powiadomienie użytkowników (jeśli dotyczy)
   - Post-mortem analysis
   - Hotfix i ponowny deploy

### 6.5. Częstotliwość Wydań
- **Major releases**: Co 6-12 miesięcy
- **Minor releases**: Co 1-2 miesiące
- **Patch releases**: W razie potrzeby (bug fixes)
- **Hotfixes**: Natychmiast w przypadku krytycznych błędów

### 6.6. CI/CD Pipeline

```yaml
# GitHub Actions workflow
Trigger: Push to main branch

Steps:
1. Install dependencies
2. Run linters (ESLint, Prettier)
3. Run type checking (TypeScript)
4. Run tests (Unit + Integration)
5. Build application (next build)
6. Run E2E tests on build
7. Deploy to production (if main branch)
   - Upload static files via FTP/SSH
   - Run database migrations
   - Restart Node.js process (if needed)
8. Send notification (Discord/Slack/Email)
```

## 7. Monitoring i Maintenance

### 7.1. Monitoring
- **Uptime Monitoring**: Uptime Robot (free tier)
- **Error Tracking**: Sentry (opcjonalnie)
- **Analytics**: Google Analytics / Plausible (privacy-friendly)
- **Database**: Regular backups (daily)

### 7.2. Maintenance Schedule
- **Daily**: Monitoring logów i metryk
- **Weekly**: Security updates (npm audit)
- **Monthly**: 
  - Database backup verification
  - Performance review
  - Disk space check
- **Quarterly**: 
  - Dependency updates
  - Security audit
  - Performance optimization review

### 7.3. Backup Strategy
- **Database Backups**:
  - Daily automated backups (retention: 7 days)
  - Weekly backups (retention: 4 weeks)
  - Monthly backups (retention: 12 months)
- **Code**: Git repository (GitHub)
- **Assets**: Backup zdjęć na zewnętrznym storage

## 8. Metryki Sukcesu

### 8.1. Metryki Techniczne
- **Uptime**: > 99.5%
- **Response Time**: < 500ms (p95)
- **Lighthouse Score**: > 90
- **Error Rate**: < 0.1%
- **Build Time**: < 5 min

### 8.2. Metryki Biznesowe
- Liczba zgłoszeń w pierwszym miesiącu: > 100
- Liczba unikalnych użytkowników: > 500
- Bounce rate: < 60%
- Średni czas na stronie: > 2 min

## 9. Ryzyka i Mitigation

| Ryzyko | Prawdopodobieństwo | Wpływ | Mitigation |
|--------|-------------------|-------|------------|
| Spam zgłoszenia | Wysokie | Średni | Rate limiting, CAPTCHA, moderacja |
| Awaria hostingu | Niskie | Wysoki | Monitoring, backup, plan migracji |
| Przeciążenie bazy | Średnie | Średni | Indeksy, optymalizacja, caching |
| RODO compliance | Średnie | Wysoki | Legal review, privacy policy |
| Niskie zainteresowanie | Średnie | Wysoki | Marketing, SEO, social media |

## 10. Roadmap

### Faza 1: MVP (Miesiące 1-2)
- ✅ Formularz zgłoszeń
- ✅ Mapa z podstawowym wyświetlaniem
- ✅ API dla CRUD operacji
- ✅ Deploy na produkcję

### Faza 2: Enhancement (Miesiące 3-4)
- 📋 Statystyki i wykresy
- 📋 Export danych do CSV
- 📋 Email notifications
- 📋 SEO optimization

### Faza 3: Growth (Miesiące 5-6)
- 📋 System moderacji
- 📋 User accounts (opcjonalnie)
- 📋 API publiczne dla partnerów
- 📋 Mobile app (PWA)

### Faza 4: Scale (Miesiące 7+)
- 📋 Integracja z systemami miejskimi
- 📋 Predictive analytics
- 📋 Rozszerzenie na inne kraje
- 📋 Premium features dla organizacji

## 11. Kontakt i Zasoby

- **Repository**: [GitHub URL]
- **Documentation**: [Docs URL]
- **Issue Tracker**: GitHub Issues
- **Communication**: [Discord/Slack]

---

**Dokument utworzony**: 2025-11-19  
**Wersja**: 1.0  
**Autor**: [Nazwa zespołu]  
**Status**: Draft
