# E2E Tests - Cola z Kranu

Testy end-to-end aplikacji "Cola z Kranu" napisane przy użyciu Playwright.

## Struktura testów

```
e2e/
├── map-viewing.spec.ts       # Testy wyświetlania mapy i interakcji
├── report-creation.spec.ts   # Testy tworzenia zgłoszeń
├── geolocation.spec.ts       # Testy funkcji geolokalizacji
└── README.md                 # Ta dokumentacja
```

## Instalacja przeglądarek

Przed pierwszym uruchomieniem testów zainstaluj przeglądarki Playwright:

```bash
npx playwright install
```

## Uruchamianie testów

### Wszystkie testy (headless mode)
```bash
npm run test:e2e
```

### UI Mode (interaktywny interfejs)
```bash
npm run test:e2e:ui
```

### Headed mode (widoczna przeglądarka)
```bash
npm run test:e2e:headed
```

### Debug mode
```bash
npm run test:e2e:debug
```

### Testy dla konkretnej przeglądarki
```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### Testy mobilne
```bash
npm run test:e2e:mobile
```

### Raport HTML
```bash
npm run test:e2e:report
```

## Zakres testów

### 1. Map Viewing (`map-viewing.spec.ts`)

Testy sprawdzające wyświetlanie i interakcje z mapą:

- ✅ Wyświetlanie mapy na stronie głównej
- ✅ Przycisk przełączania trybu (view/add)
- ✅ Przełączanie między trybem podglądu a dodawania
- ✅ Floating Action Button (FAB)
- ✅ Wyświetlanie markerów zgłoszeń
- ✅ Pokazywanie szczegółów zgłoszenia po kliknięciu markera
- ✅ Zamykanie panelu szczegółów
- ✅ Popup przy najechaniu na marker
- ✅ Nawigacja między sekcjami

### 2. Report Creation (`report-creation.spec.ts`)

Testy procesu tworzenia nowego zgłoszenia:

- ✅ Otwieranie modala przez FAB
- ✅ Otwieranie modala przez kliknięcie mapy w trybie dodawania
- ✅ Zamykanie modala przyciskiem X
- ✅ Wyświetlanie wszystkich pól formularza
- ✅ Wybieranie typów problemów
- ✅ Reguła wykluczania dla "Brak wody"
- ✅ Walidacja wymaganych pól
- ✅ Walidacja formatu email
- ✅ Wypełnianie i wysyłanie formularza
- ✅ Wyświetlanie komunikatu sukcesu
- ✅ Wypełnianie współrzędnych z kliknięcia mapy
- ✅ Obsługa błędów sieciowych

### 3. Geolocation (`geolocation.spec.ts`)

Testy funkcji automatycznej geolokalizacji:

- ✅ Wyświetlanie przycisku "Użyj mojej lokalizacji"
- ✅ Wypełnianie współrzędnych po użyciu geolokalizacji
- ✅ Stan ładowania podczas pobierania lokalizacji
- ✅ Wyłączanie przycisku podczas pobierania
- ✅ Aktualizacja istniejących współrzędnych
- ✅ Działanie z różnymi współrzędnymi
- ✅ Możliwość ręcznej edycji po użyciu geolokalizacji
- ✅ Zachowanie innych pól formularza
- ✅ Kombinacja z współrzędnymi z kliknięcia mapy

## Wymagania

Testy wymagają uruchomionego serwera deweloperskiego:

1. Backend API: `http://localhost:3001`
2. Frontend: `http://localhost:5173`

Playwright automatycznie uruchomi serwer deweloperski podczas testów (konfiguracja w `playwright.config.ts`).

## Najlepsze praktyki

### Przed commitowaniem
```bash
# Uruchom wszystkie testy
npm run test:e2e

# Sprawdź linting
npm run lint

# Sprawdź buildy
npm run build
```

### Debugowanie testów

1. **UI Mode** - najlepszy do interaktywnego debugowania:
   ```bash
   npm run test:e2e:ui
   ```

2. **Debug Mode** - krok po kroku z narzędziami deweloperskimi:
   ```bash
   npm run test:e2e:debug
   ```

3. **Headed Mode** - obserwuj testy w przeglądarce:
   ```bash
   npm run test:e2e:headed
   ```

### Zapisywanie zrzutów ekranu i śladów

Playwright automatycznie:
- Robi zrzuty ekranu przy błędach
- Nagrywa ślady (traces) przy ponownych próbach
- Zapisuje raporty w `playwright-report/`

## Środowiska

### Desktop
- Chrome (Chromium)
- Firefox
- Safari (WebKit)

### Mobile
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## CI/CD

Testy są zoptymalizowane pod CI/CD:
- Uruchamiają się w trybie headless
- 2 próby w przypadku błędu
- 1 worker (bez równoległości) dla stabilności
- Automatyczne uruchamianie serwera deweloperskiego

## Problemy i rozwiązania

### Testy czasami zawieszają się
```bash
# Zatrzymaj wszystkie procesy Node.js
pkill -f node

# Uruchom ponownie
npm run test:e2e
```

### Port 5173 zajęty
```bash
# Zabij proces na porcie 5173
lsof -ti:5173 | xargs kill -9
```

### Przeglądarki nie są zainstalowane
```bash
npx playwright install --with-deps
```

## Dodawanie nowych testów

1. Utwórz plik `*.spec.ts` w katalogu `e2e/`
2. Importuj test i expect z `@playwright/test`
3. Użyj `test.describe()` dla grupowania testów
4. Użyj `test.beforeEach()` dla setup'u
5. Napisz testy używając API Playwright

Przykład:
```typescript
import { test, expect } from '@playwright/test';

test.describe('New Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should work correctly', async ({ page }) => {
    // Twój test
    await expect(page.getByText('Hello')).toBeVisible();
  });
});
```

## Przydatne linki

- [Dokumentacja Playwright](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors](https://playwright.dev/docs/selectors)
- [Assertions](https://playwright.dev/docs/test-assertions)
