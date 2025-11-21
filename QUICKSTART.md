# 🚀 Quick Start Guide

## Krok po kroku - uruchomienie projektu

### 1️⃣ Instalacja Dependencies

```bash
# W głównym katalogu projektu
npm install

# Zainstaluj dependencies dla API
cd api
npm install
cd ..
```

### 2️⃣ Konfiguracja Environment

```bash
# Skopiuj przykładowy plik .env
cp api/.env.example api/.env

# Edytuj api/.env i ustaw wymagane wartości:
# - DATABASE_URL (już ustawione dla Dockera)
# - NOMINATIM_EMAIL (WYMAGANE - twój email)
```

**WAŻNE**: Nominatim wymaga podania emaila zgodnie z ich polityką:
```bash
# W api/.env ustaw:
NOMINATIM_EMAIL=twoj-email@example.com
```

### 3️⃣ Uruchomienie PostgreSQL (Docker)

```bash
# Start PostgreSQL + PostGIS
npm run docker:up

# Sprawdź czy działa
docker ps
# Powinien pokazać kontener "water-reports-db"

# Zobacz logi (opcjonalnie)
npm run docker:logs
```

### 4️⃣ Setup Bazy Danych

```bash
# Generuj Prisma Client
npm run db:generate

# Uruchom migracje (tworzy tabele + PostGIS)
npm run db:migrate
# Zostaniesz poproszony o nazwę migracji, wpisz: "init"

# Załaduj przykładowe dane (opcjonalnie)
npm run db:seed
```

### 5️⃣ Uruchomienie API

```bash
# Start development server
npm run dev:api

# API będzie dostępne na:
# http://localhost:3001
```

### 6️⃣ Sprawdzenie

Otwórz w przeglądarce lub użyj curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Powinno zwrócić:
# {"status":"healthy","timestamp":"...","database":"connected"}

# Lista zgłoszeń
curl http://localhost:3001/api/reports

# Statystyki
curl http://localhost:3001/api/stats?period=month
```

### 7️⃣ Prisma Studio (opcjonalnie)

```bash
# Otwórz GUI do przeglądania bazy
npm run db:studio

# Dostępne na: http://localhost:5555
```

---

## ✅ Wszystko Działa?

Jeśli widzisz:
```
[INFO] 🚀 Server running on port 3001
[INFO] 📝 Environment: development
[INFO] 🌐 CORS origins: http://localhost:5173, http://localhost:5174
[INFO] 💾 Database: localhost:5432/water_reports_dev
```

To backend jest gotowy! 🎉

---

## 🐛 Problemy?

### Docker nie działa
```bash
# Reset Docker
npm run docker:reset

# Sprawdź czy Docker Desktop jest uruchomiony
docker ps
```

### Port 5432 zajęty
```bash
# Sprawdź co zajmuje port
lsof -i:5432

# Zatrzymaj lokalny PostgreSQL
# macOS:
brew services stop postgresql

# lub zmień port w docker-compose.yml na 5433
```

### Prisma błędy
```bash
# Reinstaluj
cd api
rm -rf node_modules package-lock.json
npm install
npm run db:generate
```

### API nie odpowiada
```bash
# Sprawdź czy .env istnieje
cat api/.env

# Sprawdź logi
# API wyświetla błędy w konsoli
```

---

## 📚 Dalsze Kroki

1. **Przeczytaj [README.md](README.md)** - pełna dokumentacja
2. **Przejrzyj API endpoints** - `api/src/routes/`
3. **Testuj API** - użyj Postman/Insomnia lub curl
4. **Zobacz seed data** - `api/prisma/seed.ts`

## 🔥 Przydatne Komendy

```bash
# Development
npm run dev:api           # Start API
npm run db:studio         # Prisma Studio GUI
npm run docker:logs       # Logi Dockera

# Database
npm run db:reset          # Reset DB (USUWA DANE!)
npm run db:seed           # Załaduj przykładowe dane
npm run db:migrate        # Nowa migracja

# Docker
npm run docker:up         # Start
npm run docker:down       # Stop
npm run docker:reset      # Full reset
```

## 📖 Dokumentacja

- **API Dokumentacja**: [05-implementacja-backend.md](05-implementacja-backend.md)
- **Konfiguracja**: [06-konfiguracja-lokalna.md](06-konfiguracja-lokalna.md)
- **Claude Guide**: [CLAUDE.md](CLAUDE.md)
