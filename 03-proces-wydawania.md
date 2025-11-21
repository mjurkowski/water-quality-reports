# Proces Wydawania Aplikacji (Release Process)

## 1. Przegląd Procesu

### 1.1. Filozofia Wydań
- **Częste, małe wydania** zamiast rzadkich, dużych
- **Automatyzacja** wszędzie gdzie możliwe
- **Rollback** musi być szybki i prosty
- **Testowanie** przed każdym wydaniem
- **Dokumentacja** każdej zmiany

### 1.2. Typy Wydań

| Typ | Wersja | Przykład | Opis | Częstotliwość |
|-----|--------|----------|------|---------------|
| **Hotfix** | PATCH | v1.0.1 → v1.0.2 | Krytyczne poprawki błędów | W razie potrzeby |
| **Patch** | PATCH | v1.0.0 → v1.0.1 | Drobne poprawki, bugfixy | Co 1-2 tygodnie |
| **Minor** | MINOR | v1.0.0 → v1.1.0 | Nowe funkcje (backward compatible) | Co 1-2 miesiące |
| **Major** | MAJOR | v1.0.0 → v2.0.0 | Breaking changes | Co 6-12 miesięcy |

## 2. Workflow Git

### 2.1. Strategia Branchy

```
main (production)
  ↑
  ├── release/v1.1.0 (przygotowanie wydania)
  ↑
develop (integration)
  ↑
  ├── feature/add-statistics-page
  ├── feature/improve-map-performance
  ├── bugfix/fix-date-formatting
  └── hotfix/critical-db-connection
```

### 2.2. Branch Naming Convention

```bash
# Feature branches
feature/<ticket-id>-<short-description>
feature/123-add-statistics-page

# Bugfix branches
bugfix/<ticket-id>-<short-description>
bugfix/456-fix-date-formatting

# Hotfix branches (z main)
hotfix/<version>-<description>
hotfix/v1.0.1-critical-db-fix

# Release branches
release/v<version>
release/v1.1.0
```

### 2.3. Commit Messages

Używamy konwencji [Conventional Commits](https://www.conventionalcommits.org/):

```bash
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Typy commitów:**
- `feat`: Nowa funkcjonalność
- `fix`: Poprawka błędu
- `docs`: Zmiany w dokumentacji
- `style`: Formatowanie kodu (bez zmian logiki)
- `refactor`: Refaktoryzacja kodu
- `perf`: Optymalizacja wydajności
- `test`: Dodanie/zmiana testów
- `chore`: Zmiany w procesie buildowania, dependencies

**Przykłady:**
```bash
feat(map): add clustering for report markers
fix(api): resolve database connection timeout issue
docs(readme): update installation instructions
refactor(components): extract common Button component
perf(db): add index on reports.reported_at column
test(api): add integration tests for POST /api/reports
chore(deps): upgrade Next.js to v14.1.0
```

## 3. Pre-Release Checklist

### 3.1. Development Phase

- [ ] **Code Review**
  - Wszystkie PR przeszły code review
  - Co najmniej 1 approval od innego developera
  - Rozwiązane wszystkie komentarze

- [ ] **Tests**
  - Wszystkie unit tests przechodzą
  - Wszystkie integration tests przechodzą
  - E2E tests przeszły na środowisku staging
  - Coverage > 80% dla critical paths

- [ ] **Code Quality**
  - Linting przeszedł (0 errors)
  - Type checking bez błędów
  - Prettier formatting zastosowany
  - No console.logs w production code

- [ ] **Documentation**
  - Aktualizacja CHANGELOG.md
  - Aktualizacja README.md (jeśli potrzebna)
  - API documentation zaktualizowana
  - Inline comments dla skomplikowanych fragmentów

### 3.2. Pre-Deploy Phase

- [ ] **Database**
  - Migrations przetestowane lokalnie
  - Migrations przetestowane na staging
  - Backup bazy danych wykonany
  - Rollback plan przygotowany

- [ ] **Environment Variables**
  - Wszystkie nowe zmienne dodane do .env.production
  - Zmienne zaktualizowane na serwerze
  - Secrets zaktualizowane w GitHub Actions

- [ ] **Dependencies**
  - `npm audit` nie pokazuje critical vulnerabilities
  - Wszystkie dependencies aktualne
  - Lock file (package-lock.json) zaktualizowany

- [ ] **Build**
  - Production build kompiluje się bez błędów
  - Lokalny test production build działa
  - Bundle size w akceptowalnych granicach (<500KB)

### 3.3. Testing Checklist

- [ ] **Functional Testing**
  - Formularz zgłoszeń działa poprawnie
  - Mapa wyświetla zgłoszenia
  - Filtry działają
  - Upload zdjęć działa
  - Geolokalizacja działa

- [ ] **Performance Testing**
  - Lighthouse score > 90
  - Load time < 2s
  - API response time < 500ms
  - Large datasets (1000+ reports) renderują się płynnie

- [ ] **Cross-browser Testing**
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)

- [ ] **Mobile Testing**
  - iOS Safari
  - Android Chrome
  - Responsive design na różnych rozdzielczościach

- [ ] **Security**
  - SQL injection tests
  - XSS tests
  - CSRF protection
  - Rate limiting works

## 4. Release Process - Krok po kroku

### 4.1. Minor Release (np. v1.1.0)

#### Krok 1: Przygotowanie Release Branch

```bash
# 1. Upewnij się że develop jest up-to-date
git checkout develop
git pull origin develop

# 2. Utwórz release branch
git checkout -b release/v1.1.0

# 3. Zaktualizuj wersję w package.json
npm version minor --no-git-tag-version
# To zmieni wersję z 1.0.0 na 1.1.0

# 4. Zaktualizuj CHANGELOG.md
# Dodaj sekcję dla v1.1.0 z listą zmian

# 5. Commit zmian
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): prepare v1.1.0"

# 6. Push release branch
git push origin release/v1.1.0
```

#### Krok 2: Testy na Release Branch

```bash
# Na release branch uruchom wszystkie testy
npm run test
npm run test:e2e
npm run lint
npm run type-check
npm run build

# Jeśli są błędy, napraw je na release branch
git commit -m "fix(release): resolve issue X"
```

#### Krok 3: Merge do Main

```bash
# 1. Merge release branch do main
git checkout main
git pull origin main
git merge --no-ff release/v1.1.0 -m "Merge release/v1.1.0 into main"

# 2. Utwórz git tag
git tag -a v1.1.0 -m "Release version 1.1.0

Features:
- Add statistics page
- Improve map performance
- Add export to CSV

Bug Fixes:
- Fix date formatting issue
- Resolve database connection timeout
"

# 3. Push do origin
git push origin main
git push origin v1.1.0
```

#### Krok 4: Deploy na Produkcję

```bash
# Automatyczny deploy przez GitHub Actions
# lub manualny:
npm run deploy:production
```

#### Krok 5: Weryfikacja

```bash
# 1. Sprawdź czy aplikacja działa
npm run health:check

# 2. Manual smoke test
# - Otwórz aplikację w przeglądarce
# - Sprawdź kluczowe funkcje
# - Sprawdź logi błędów

# 3. Monitorowanie przez pierwsze 30 minut
# - Sprawdź error rate w Sentry (jeśli używasz)
# - Sprawdź logi serwera
# - Sprawdź response times
```

#### Krok 6: Merge z powrotem do Develop

```bash
# 1. Merge main z powrotem do develop
git checkout develop
git pull origin develop
git merge --no-ff main -m "Merge main back to develop after v1.1.0 release"
git push origin develop

# 2. Usuń release branch
git branch -d release/v1.1.0
git push origin --delete release/v1.1.0
```

#### Krok 7: Post-Release Tasks

- [ ] Aktualizuj project board / issues
- [ ] Zamknij milestone v1.1.0
- [ ] Wyślij komunikat o nowym wydaniu (jeśli dotyczy)
- [ ] Zaktualizuj dokumentację użytkownika
- [ ] Monitoruj aplikację przez kolejne 24h

### 4.2. Hotfix Release (np. v1.0.1)

#### Krok 1: Utworzenie Hotfix Branch

```bash
# 1. Branch z main (nie develop!)
git checkout main
git pull origin main
git checkout -b hotfix/v1.0.1-critical-db-fix

# 2. Napraw błąd
# ... edytuj pliki ...

# 3. Commit fix
git add .
git commit -m "fix(db): resolve critical connection timeout issue

This fixes a critical bug where database connections
would timeout after 24 hours of inactivity.

Closes #789"

# 4. Zaktualizuj wersję
npm version patch --no-git-tag-version

# 5. Zaktualizuj CHANGELOG.md
# Dodaj sekcję dla v1.0.1

# 6. Commit version bump
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): bump version to v1.0.1"

# 7. Push
git push origin hotfix/v1.0.1-critical-db-fix
```

#### Krok 2: Szybkie Testy

```bash
# Uruchom tylko krytyczne testy
npm run test -- --testPathPattern=critical
npm run build
```

#### Krok 3: Merge i Deploy

```bash
# 1. Merge do main
git checkout main
git merge --no-ff hotfix/v1.0.1-critical-db-fix

# 2. Tag
git tag -a v1.0.1 -m "Hotfix v1.0.1: Critical database connection fix"

# 3. Push
git push origin main
git push origin v1.0.1

# 4. Deploy (automatycznie lub manualnie)
npm run deploy:production

# 5. Merge do develop
git checkout develop
git merge --no-ff hotfix/v1.0.1-critical-db-fix
git push origin develop

# 6. Usuń branch
git branch -d hotfix/v1.0.1-critical-db-fix
git push origin --delete hotfix/v1.0.1-critical-db-fix
```

### 4.3. Patch Release (np. v1.0.1)

Proces identyczny jak Minor Release, ale:
- Branch z develop (nie main)
- Używamy `npm version patch` zamiast `minor`
- Tylko bugfixy, bez nowych features

## 5. Rollback Procedure

### 5.1. Szybki Rollback (< 1 godzina od deployment)

```bash
# 1. Powrót do poprzedniego taga
git checkout v1.0.0

# 2. Build i deploy
npm run build
npm run deploy:production

# 3. Rollback bazy danych (jeśli były migrations)
# Przywróć backup z przed deployment
npm run backup:restore -- backups/database/backup_20231119_120000.sql.gz
```

### 5.2. Pełny Rollback (> 1 godzina od deployment)

```bash
# 1. Utwórz revert commit
git revert v1.1.0

# 2. Lub stwórz nowy hotfix branch
git checkout -b hotfix/v1.1.1-rollback-v1.1.0
# ... ręczny revert zmian ...

# 3. Normalny proces hotfix release
```

### 5.3. Database Rollback

```bash
# 1. Zatrzymaj aplikację (żeby nie było nowych zapisów)
# ssh user@server "pm2 stop water-reports"

# 2. Przywróć backup
BACKUP_FILE="backups/database/backup_20231119_120000.sql.gz"
gunzip -c "$BACKUP_FILE" | psql -h host -U user -d database

# 3. Uruchom aplikację ze starą wersją
# ssh user@server "pm2 start water-reports"

# 4. Weryfikuj
npm run health:check
```

## 6. Automatyzacja z GitHub Actions

### 6.1. Automatyczny Deploy przy Push do Main

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test
      - name: Build
        run: npm run build
      - name: Deploy
        run: npm run deploy:production
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          FTP_USER: ${{ secrets.FTP_USER }}
          FTP_PASS: ${{ secrets.FTP_PASS }}
```

### 6.2. Automatyczne Testy dla Pull Requests

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type check
        run: npm run type-check
      - name: Tests
        run: npm run test:coverage
      - name: Build
        run: npm run build
```

## 7. Release Notes Template

### 7.1. CHANGELOG.md Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Feature X in progress
### Changed
- Refactoring Y

## [1.1.0] - 2023-11-19

### Added
- Statistics page with charts and visualizations
- Export to CSV functionality
- Map clustering for better performance with large datasets
- Voivodeship filter on map

### Changed
- Improved map loading performance by 40%
- Updated Next.js to v14.1.0
- Optimized database queries with new indexes

### Fixed
- Fixed date formatting in reports list
- Resolved database connection timeout issue
- Fixed map zoom level persistence

### Security
- Updated dependencies to fix CVE-2023-XXXXX

## [1.0.1] - 2023-11-10

### Fixed
- Critical: Database connection timeout after 24h inactivity
- Photo upload failing for files > 3MB

## [1.0.0] - 2023-11-01

### Added
- Initial release
- Report submission form
- Interactive map with OpenStreetMap
- Report listing and filtering
- Photo uploads
- Geocoding support
```

### 7.2. GitHub Release Notes Template

```markdown
## 🎉 Release v1.1.0

### ✨ New Features
- **Statistics Dashboard**: View comprehensive statistics about water quality reports
- **CSV Export**: Export filtered data for analysis
- **Map Clustering**: Better performance when viewing hundreds of reports
- **Voivodeship Filtering**: Filter reports by region

### 🚀 Improvements
- Map loading is now 40% faster
- Database queries optimized with new indexes
- Updated to Next.js v14.1.0

### 🐛 Bug Fixes
- Fixed date formatting in reports list (#123)
- Resolved database connection timeout issue (#456)
- Fixed map zoom level not persisting (#789)

### 🔒 Security
- Updated dependencies to address CVE-2023-XXXXX

### 📚 Documentation
- Updated API documentation
- Added troubleshooting guide

### 🙏 Contributors
Special thanks to @user1, @user2, and @user3 for their contributions!

---

**Full Changelog**: https://github.com/org/repo/compare/v1.0.0...v1.1.0
```

## 8. Metryki i Monitoring

### 8.1. Metryki do Śledzenia

Po każdym deploy monitoruj:

- **Error Rate**: Powinien pozostać < 0.1%
- **Response Time**: p95 < 500ms
- **Uptime**: > 99.5%
- **Database Connections**: Brak connection leaks
- **Memory Usage**: Stabilny, bez memory leaks
- **CPU Usage**: < 80% average

### 8.2. Alerty

Skonfiguruj alerty dla:

```yaml
# Uptime Robot lub podobne
Alerts:
  - HTTP status not 200 for > 5 minutes → Email + SMS
  - Response time > 3s for > 5 minutes → Email
  - SSL certificate expiring in < 7 days → Email

# Sentry (jeśli używasz)
  - Error rate increase > 50% → Email
  - New error type detected → Email
  - Critical error logged → SMS
```

## 9. Post-Mortem Template

Gdy coś pójdzie źle, przeprowadź post-mortem:

```markdown
# Post-Mortem: [Incident Title]

**Date**: 2023-11-19
**Duration**: 2h 15m
**Impact**: 1,234 users affected
**Severity**: High

## Summary
Brief description of what happened.

## Timeline (UTC)
- 14:30 - Deployed v1.1.0
- 14:35 - First error reports
- 14:40 - Issue identified
- 14:45 - Rollback initiated
- 16:45 - System fully restored

## Root Cause
Detailed explanation of what caused the issue.

## Impact
- Users couldn't submit reports for 2h 15m
- No data loss
- 1,234 users affected

## Resolution
How we fixed it.

## Action Items
- [ ] Add better error handling for X
- [ ] Improve monitoring for Y
- [ ] Update runbook with Z
- [ ] Add integration test for this scenario

## Lessons Learned
What we learned and how we'll prevent this in the future.
```

## 10. Quick Reference

### 10.1. Common Commands

```bash
# Start new feature
git checkout develop
git pull
git checkout -b feature/123-new-feature

# Finish feature
git checkout develop
git merge --no-ff feature/123-new-feature
git push origin develop
git branch -d feature/123-new-feature

# Create release
git checkout develop
git checkout -b release/v1.1.0
npm version minor --no-git-tag-version
# Update CHANGELOG
git add . && git commit -m "chore: prepare v1.1.0"

# Deploy release
git checkout main
git merge --no-ff release/v1.1.0
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main --tags
npm run deploy:production

# Hotfix
git checkout main
git checkout -b hotfix/v1.0.1-fix
# Fix bug
npm version patch --no-git-tag-version
git commit -am "fix: critical bug"
git checkout main && git merge hotfix/v1.0.1-fix
git tag v1.0.1
git push origin main --tags
```

### 10.2. Emergency Contacts

```
On-Call Developer: [Phone/Email]
Database Admin: [Contact]
Hosting Support: [myDevil support]
Backup Admin: [Contact]
```

---

**Dokument utworzony**: 2025-11-19  
**Wersja**: 1.0  
**Status**: Production Ready
