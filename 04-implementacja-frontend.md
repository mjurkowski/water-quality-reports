# Implementacja Frontendu - React + Vite

## 1. Przegląd

### 1.1. Stack Technologiczny Frontend
- **Framework**: React 18+ z Vite
- **Język**: TypeScript (strict mode)
- **Routing**: React Router v6
- **Styling**: shadcn/ui + Tailwind CSS
- **Mapy**: Leaflet + react-leaflet
- **Kafelki Map**: MapTiler
- **Formularze**: React Hook Form + Zod
- **Grafika/Wykresy**: Recharts
- **State Management**: Redux Toolkit (RTK)
- **API Client**: RTK Query + OpenAPI TypeScript code generation
- **Build Tool**: Vite

### 1.2. Architektura Frontend

```
Frontend Architecture (One-pager):
├── Sections (No routing)
│   ├── HeroSection
│   ├── ReportFormSection
│   ├── MapSection
│   ├── StatsSection
│   ├── AboutSection
│   └── FooterSection
├── Components (Reusable)
├── API Layer (RTK Query + OpenAPI generated)
│   ├── store.ts (Redux store)
│   ├── api.ts (RTK Query API)
│   └── generated/ (OpenAPI types & endpoints)
└── State Management (Redux Toolkit)
```

## 2. Etapy Implementacji

### Etap 1: Setup Projektu (Tydzień 1) ⏱️ ~4-6h

#### 1.1. Inicjalizacja Projektu

```bash
# Utwórz website folder (one-pager application)
npm create vite@latest website -- --template react-ts

cd website

# Instalacja dependencies
npm install react-hook-form @hookform/resolvers zod
npm install @reduxjs/toolkit react-redux
npm install leaflet react-leaflet @types/leaflet
npm install leaflet.markercluster @types/leaflet.markercluster
npm install recharts
npm install date-fns
npm install clsx tailwind-merge

# OpenAPI code generation
npm install -D openapi-typescript @rtk-query/codegen-openapi

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui setup
npx shadcn-ui@latest init

# Odpowiedz na pytania podczas instalacji:
# - TypeScript: yes
# - Style: Default
# - Base color: Slate (lub inny według preferencji)
# - CSS variables: yes
# - Tailwind config: Yes (use tailwind.config.js)
# - Components directory: src/components
# - Utils directory: src/lib/utils
# - React Server Components: no
# - Write configuration: yes
```

#### 1.2. Konfiguracja Vite

**Plik: `vite.config.ts`**
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
});
```

#### 1.3. Konfiguracja Tailwind

**Plik: `tailwind.config.js`** (wygenerowany przez shadcn/ui init)
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**Plik: `src/index.css`** (wygenerowany przez shadcn/ui init)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Dodaj komponenty shadcn/ui:**
```bash
# Zainstaluj najczęściej używane komponenty
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add badge
```

#### 1.4. Package.json Scripts

**Plik: `package.json`** (dodaj do sekcji scripts)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "openapi:generate-types": "openapi-typescript ../api/openapi/openapi.yaml -o ./src/lib/api/generated/schema.ts",
    "openapi:generate-client": "npm run openapi:generate-types"
  }
}
```

#### 1.5. Konfiguracja TypeScript

**Plik: `tsconfig.json`**
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

### Etap 2: Struktura Aplikacji (Tydzień 1) ⏱️ ~4-6h

#### 2.1. One-Pager App Setup (No Routing)

**Plik: `src/App.tsx`**
```typescript
import { Provider } from 'react-redux';
import { store } from '@/lib/api/store';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { ReportFormSection } from '@/components/sections/ReportFormSection';
import { MapSection } from '@/components/sections/MapSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { Footer } from '@/components/layout/Footer';

function App() {
  return (
    <Provider store={store}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main>
          <HeroSection />
          <ReportFormSection />
          <MapSection />
          <StatsSection />
          <AboutSection />
        </main>
        <Footer />
      </div>
    </Provider>
  );
}

export default App;
```

#### 2.2. Header Component (Smooth Scroll Navigation)

**Plik: `src/components/layout/Header.tsx`**
```typescript
import { clsx } from 'clsx';

export function Header() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'hero', label: 'Start' },
    { id: 'report-form', label: 'Zgłoś problem' },
    { id: 'map', label: 'Mapa' },
    { id: 'stats', label: 'Statystyki' },
    { id: 'about', label: 'O projekcie' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <button
            onClick={() => scrollToSection('hero')}
            className="text-xl font-bold text-primary-600"
          >
            Cola z Kranu 🚰
          </button>

          <nav className="hidden space-x-6 md:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-gray-700 transition-colors hover:text-primary-600"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
```

#### 2.3. Example Section Structure

**Plik: `src/components/sections/HeroSection.tsx`**
```typescript
export function HeroSection() {
  const scrollToForm = () => {
    const element = document.getElementById('report-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="bg-gradient-to-br from-blue-50 to-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900">
          Cola z Kranu 🚰
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Zgłaszaj i przeglądaj problemy z jakością wody w Polsce
        </p>
        <button
          onClick={scrollToForm}
          className="btn-primary text-lg"
        >
          Zgłoś Problem
        </button>
      </div>
    </section>
  );
}
```

### Etap 3: API Client - RTK Query + OpenAPI (Tydzień 1-2) ⏱️ ~5-6h

#### 3.1. OpenAPI Type Generation

Najpierw upewnij się, że API generuje specyfikację OpenAPI (patrz [05-implementacja-backend.md](05-implementacja-backend.md)).

**Wygeneruj typy TypeScript z OpenAPI:**
```bash
# W folderze website/
npm run openapi:generate-client
```

To utworzy plik `src/lib/api/generated/schema.ts` z typami TypeScript wygenerowanymi z OpenAPI spec.

#### 3.2. Redux Store Setup

**Plik: `src/lib/api/store.ts`**
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### 3.3. RTK Query API Definition

**Plik: `src/lib/api/api.ts`**
```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { paths } from './generated/schema';

// Type helpers for OpenAPI paths
type ReportListResponse = paths['/reports']['get']['responses']['200']['content']['application/json'];
type ReportResponse = paths['/reports/{uuid}']['get']['responses']['200']['content']['application/json'];
type CreateReportRequest = paths['/reports']['post']['requestBody']['content']['application/json'];
type CreateReportResponse = paths['/reports']['post']['responses']['201']['content']['application/json'];
type StatsResponse = paths['/stats']['get']['responses']['200']['content']['application/json'];

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || '/api',
  }),
  tagTypes: ['Report', 'Stats'],
  endpoints: (builder) => ({
    // GET /reports - List all reports with filters
    getReports: builder.query<ReportListResponse, {
      bounds?: string;
      type?: string | string[];
      startDate?: string;
      endDate?: string;
      city?: string;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/reports',
        params,
      }),
      providesTags: ['Report'],
    }),

    // GET /reports/:uuid - Get single report
    getReport: builder.query<ReportResponse, string>({
      query: (uuid) => `/reports/${uuid}`,
      providesTags: (result, error, uuid) => [{ type: 'Report', id: uuid }],
    }),

    // POST /reports - Create new report
    createReport: builder.mutation<CreateReportResponse, CreateReportRequest>({
      query: (body) => ({
        url: '/reports',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Report', 'Stats'],
    }),

    // DELETE /reports/:uuid - Delete report
    deleteReport: builder.mutation<void, { uuid: string; deleteToken: string }>({
      query: ({ uuid, deleteToken }) => ({
        url: `/reports/${uuid}`,
        method: 'DELETE',
        headers: {
          'X-Delete-Token': deleteToken,
        },
      }),
      invalidatesTags: (result, error, { uuid }) => [
        { type: 'Report', id: uuid },
        'Report',
        'Stats',
      ],
    }),

    // GET /stats - Get statistics
    getStats: builder.query<StatsResponse, {
      groupBy?: 'day' | 'week' | 'month';
      startDate?: string;
      endDate?: string;
      type?: string | string[];
    }>({
      query: (params) => ({
        url: '/stats',
        params,
      }),
      providesTags: ['Stats'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetReportsQuery,
  useGetReportQuery,
  useCreateReportMutation,
  useDeleteReportMutation,
  useGetStatsQuery,
} = api;
```

#### 3.4. Usage Hooks in Components

**Przykład: Pobieranie raportów**
```typescript
import { useGetReportsQuery } from '@/lib/api/api';

function MapSection() {
  const { data, isLoading, error } = useGetReportsQuery({
    limit: 100,
  });

  if (isLoading) return <div>Ładowanie...</div>;
  if (error) return <div>Błąd ładowania danych</div>;

  return (
    <div>
      {data?.reports.map(report => (
        <div key={report.uuid}>{report.description}</div>
      ))}
    </div>
  );
}
```

**Przykład: Tworzenie raportu**
```typescript
import { useCreateReportMutation } from '@/lib/api/api';

function ReportFormSection() {
  const [createReport, { isLoading, error }] = useCreateReportMutation();

  const handleSubmit = async (formData: CreateReportRequest) => {
    try {
      const result = await createReport(formData).unwrap();
      console.log('Report created:', result.id);
      // Show success message
    } catch (err) {
      console.error('Failed to create report:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

#### 3.5. Caching & Auto-Refetching

RTK Query automatycznie zarządza cache i refetch:

- **Cache**: Wyniki zapytań są cache'owane i współdzielone między komponentami
- **Auto-refetch**: Po mutacji (create/delete) automatycznie refetchuje powiązane zapytania (dzięki `invalidatesTags`)
- **Background sync**: Automatycznie refetchuje po powrocie do karty (`refetchOnFocus`)
- **Optimistic updates**: Można dodać optimistic updates dla lepszego UX

**Przykład refetch on window focus:**
```typescript
export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Enable listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);
```

### Etap 4: Komponenty UI z shadcn/ui (Tydzień 2) ⏱️ ~4-6h

**Komponenty shadcn/ui są już zainstalowane i gotowe do użycia!**

shadcn/ui dostarcza gotowe komponenty w [src/components/ui/](src/components/ui/), które możesz importować bezpośrednio:

```typescript
// Przykłady użycia komponentów shadcn/ui
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
```

#### 4.1. Przykład użycia Button

```typescript
import { Button } from '@/components/ui/button';

// Różne warianty
<Button variant="default">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="destructive">Delete Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>

// Różne rozmiary
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Ładowanie...
</Button>
```

#### 4.2. Przykład użycia Input z Label

```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="twoj@email.pl"
  />
</div>
```

#### 4.3. Przykład użycia Card

```typescript
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Tytuł karty</CardTitle>
    <CardDescription>Opis karty</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Zawartość karty</p>
  </CardContent>
  <CardFooter>
    <Button>Akcja</Button>
  </CardFooter>
</Card>
```

#### 4.4. Customowe komponenty (jeśli potrzebne)

Jeśli potrzebujesz customowych komponentów specyficznych dla projektu (np. PhotoUpload), twórz je w [src/components/custom/](src/components/custom/) aby odróżnić od komponentów shadcn/ui.

### Etap 5: Formularz Zgłoszenia (Tydzień 2-3) ⏱️ ~10-12h

#### 5.1. Validation Schema

**Plik: `src/lib/utils/validation.ts`**
```typescript
import { z } from 'zod';

export const reportTypes = [
  { value: 'brown_water', label: 'Brunatna woda' },
  { value: 'bad_smell', label: 'Nieprzyjemny zapach' },
  { value: 'sediment', label: 'Osad/zawiesiny' },
  { value: 'pressure', label: 'Niskie ciśnienie' },
  { value: 'no_water', label: 'Brak wody' },
  { value: 'other', label: 'Inne' },
] as const;

export const reportFormSchema = z.object({
  types: z.array(z.enum(['brown_water', 'bad_smell', 'sediment', 'pressure', 'no_water', 'other']))
    .min(1, 'Wybierz przynajmniej jeden typ problemu')
    .max(3, 'Możesz wybrać maksymalnie 3 typy problemów'),
  description: z.string().max(1000, 'Opis nie może być dłuższy niż 1000 znaków').optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  photos: z.array(z.object({
    base64: z.string(),
    mimeType: z.string(),
  }))
    .max(5, 'Możesz dodać maksymalnie 5 zdjęć')
    .optional(),
  reportedAt: z.string().datetime(),
  contactEmail: z.string().email('Nieprawidłowy adres email').optional().or(z.literal('')),
});

export type ReportFormData = z.infer<typeof reportFormSchema>;
```

#### 5.2. Report Form Section Component (z shadcn/ui)

**Plik: `src/components/sections/ReportFormSection.tsx`**
```typescript
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportFormSchema, reportTypes, type ReportFormData } from '@/lib/utils/validation';
import { useCreateReportMutation } from '@/lib/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { LocationPicker } from '@/components/map/LocationPicker';
import { PhotoUpload } from '@/components/custom/PhotoUpload';

export function ReportFormSection() {
  const [createReport, { isLoading, error }] = useCreateReportMutation();
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      types: [],
      reportedAt: new Date().toISOString(),
    },
  });

  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const selectedTypes = watch('types');

  const onSubmit = async (data: ReportFormData) => {
    try {
      const result = await createReport(data).unwrap();
      setSubmitSuccess(true);
      reset();
      // Scroll to map to show the new report
      setTimeout(() => {
        document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting report:', err);
    }
  };

  const handleTypeToggle = (typeValue: string) => {
    const currentTypes = selectedTypes || [];
    const newTypes = currentTypes.includes(typeValue)
      ? currentTypes.filter(t => t !== typeValue)
      : [...currentTypes, typeValue];
    setValue('types', newTypes);
  };

  if (submitSuccess) {
    return (
      <section id="report-form" className="bg-background py-16">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-md text-center">
            <CardContent className="pt-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold mb-4">Dziękujemy!</h2>
              <p className="text-muted-foreground">Twoje zgłoszenie zostało przyjęte</p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="report-form" className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-3xl font-bold">Zgłoś Problem z Wodą</h2>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Type selection - Multiple checkboxes */}
                <div className="space-y-2">
                  <Label>
                    Typ problemu * <span className="text-muted-foreground">(możesz wybrać do 3)</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {reportTypes.map((type) => (
                      <div
                        key={type.value}
                        className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent"
                      >
                        <Checkbox
                          id={type.value}
                          checked={selectedTypes?.includes(type.value) || false}
                          onCheckedChange={() => handleTypeToggle(type.value)}
                        />
                        <Label
                          htmlFor={type.value}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.types && (
                    <p className="text-sm text-destructive">{errors.types.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Opis (opcjonalnie)</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    rows={4}
                    placeholder="Opisz problem..."
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                {/* Photo upload */}
                <div className="space-y-2">
                  <Label>
                    Zdjęcia (opcjonalnie) <span className="text-muted-foreground">(max 5, do 5MB każde)</span>
                  </Label>
                  <PhotoUpload
                    maxPhotos={5}
                    maxSizePerPhoto={5 * 1024 * 1024} // 5MB
                    onChange={(photos) => setValue('photos', photos)}
                  />
                  {errors.photos && (
                    <p className="text-sm text-destructive">{errors.photos.message}</p>
                  )}
                </div>

                {/* Location picker */}
                <div className="space-y-2">
                  <Label>Lokalizacja *</Label>
                  <LocationPicker
                    latitude={latitude}
                    longitude={longitude}
                    onLocationChange={(lat, lng, address) => {
                      setValue('latitude', lat);
                      setValue('longitude', lng);
                      setValue('address', address);
                    }}
                  />
                  {(errors.latitude || errors.longitude) && (
                    <p className="text-sm text-destructive">Wybierz lokalizację na mapie</p>
                  )}
                </div>

                {/* Contact email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email kontaktowy (opcjonalnie)</Label>
                  <Input
                    id="email"
                    {...register('contactEmail')}
                    type="email"
                    placeholder="twoj@email.pl"
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
                  )}
                </div>

                {/* Submit */}
                <div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Wysyłanie...' : 'Wyślij Zgłoszenie'}
                  </Button>
                  {error && (
                    <p className="mt-2 text-sm text-destructive">
                      Wystąpił błąd podczas wysyłania zgłoszenia. Spróbuj ponownie.
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
```

#### 5.3. Photo Upload Component (Custom)

**Plik: `src/components/custom/PhotoUpload.tsx`**
```typescript
import { useState } from 'react';
import { clsx } from 'clsx';

interface Photo {
  base64: string;
  mimeType: string;
}

interface PhotoUploadProps {
  maxPhotos: number;
  maxSizePerPhoto: number;
  onChange: (photos: Photo[]) => void;
}

export function PhotoUpload({ maxPhotos, maxSizePerPhoto, onChange }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError(null);

    if (photos.length + files.length > maxPhotos) {
      setError(`Możesz dodać maksymalnie ${maxPhotos} zdjęć`);
      return;
    }

    const newPhotos: Photo[] = [];

    for (const file of files) {
      if (file.size > maxSizePerPhoto) {
        setError(`Zdjęcie ${file.name} jest za duże (max ${maxSizePerPhoto / 1024 / 1024}MB)`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        setError(`Plik ${file.name} nie jest zdjęciem`);
        continue;
      }

      const base64 = await fileToBase64(file);
      newPhotos.push({
        base64,
        mimeType: file.type,
      });
    }

    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    onChange(updatedPhotos);
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onChange(updatedPhotos);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div key={index} className="relative">
            <img
              src={photo.base64}
              alt={`Zdjęcie ${index + 1}`}
              className="h-24 w-full rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500">
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs text-gray-500">Dodaj</span>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### Etap 6: Mapa (Tydzień 3-4) ⏱️ ~12-16h

#### 6.1. Map Component

**Plik: `src/components/map/Map.tsx`**
```typescript
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center: [number, number];
  zoom: number;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    type: string;
  }>;
  onMarkerClick?: (id: string) => void;
}

export function Map({ center, zoom, markers = [], onMarkerClick }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current).setView(center, zoom);

    const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;
    L.tileLayer(
      `https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${maptilerKey}`,
      {
        attribution: '© MapTiler © OpenStreetMap contributors',
        maxZoom: 18,
      }
    ).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((marker) => {
      const icon = L.divIcon({
        html: getMarkerIcon(marker.type),
        className: 'custom-marker',
        iconSize: [30, 30],
      });

      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon })
        .addTo(map.current!);

      if (onMarkerClick) {
        leafletMarker.on('click', () => onMarkerClick(marker.id));
      }

      markersRef.current.push(leafletMarker);
    });
  }, [markers, onMarkerClick]);

  return <div ref={mapContainer} className="h-full w-full" />;
}

function getMarkerIcon(type: string): string {
  const colors: Record<string, string> = {
    brown_water: '#8B4513',
    bad_smell: '#FFD700',
    sediment: '#A9A9A9',
    pressure: '#FF6347',
    no_water: '#1E90FF',
    other: '#808080',
  };

  const color = colors[type] || '#808080';

  return `
    <svg width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `;
}
```

#### 6.2. Map Section with Clustering

**Plik: `src/components/sections/MapSection.tsx`**
```typescript
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useGetReportsQuery } from '@/lib/api/api';
import { reportTypes } from '@/lib/utils/validation';

export function MapSection() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markerCluster = useRef<L.MarkerClusterGroup | null>(null);

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const { data, isLoading } = useGetReportsQuery({
    type: selectedTypes.length > 0 ? selectedTypes : undefined,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current).setView([52.0, 19.0], 6);

    const maptilerKey = import.meta.env.VITE_MAPTILER_KEY;
    L.tileLayer(
      `https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=${maptilerKey}`,
      {
        attribution: '© MapTiler © OpenStreetMap contributors',
        maxZoom: 18,
      }
    ).addTo(map.current);

    // Initialize marker cluster group
    markerCluster.current = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });

    map.current.addLayer(markerCluster.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!markerCluster.current || !data?.reports) return;

    markerCluster.current.clearLayers();

    data.reports.forEach((report) => {
      const primaryType = report.types[0]; // Use first type for marker color
      const icon = L.divIcon({
        html: getMarkerIcon(primaryType),
        className: 'custom-marker',
        iconSize: [30, 30],
      });

      const marker = L.marker([report.latitude, report.longitude], { icon });

      marker.on('click', () => {
        setSelectedReport(report);
      });

      markerCluster.current!.addLayer(marker);
    });
  }, [data]);

  const handleTypeFilter = (typeValue: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeValue)
        ? prev.filter(t => t !== typeValue)
        : [...prev, typeValue]
    );
  };

  return (
    <section id="map" className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-bold text-center">Mapa Zgłoszeń</h2>

        {/* Filter buttons */}
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {reportTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTypeFilter(type.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedTypes.includes(type.value)
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Map container */}
        <div className="relative h-[600px] rounded-lg overflow-hidden shadow-lg">
          <div ref={mapContainer} className="h-full w-full" />

          {/* Selected report popup */}
          {selectedReport && (
            <div className="absolute right-4 top-4 w-80 bg-white p-4 shadow-lg rounded-lg z-[1000]">
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-2 flex flex-wrap gap-1">
                {selectedReport.types.map((type: string) => {
                  const typeLabel = reportTypes.find(t => t.value === type)?.label;
                  return (
                    <span
                      key={type}
                      className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700"
                    >
                      {typeLabel}
                    </span>
                  );
                })}
              </div>

              <p className="text-sm text-gray-600 mb-2">{selectedReport.description}</p>

              {selectedReport.photos && selectedReport.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {selectedReport.photos.map((photo: any, index: number) => (
                    <img
                      key={index}
                      src={photo.url}
                      alt={`Zdjęcie ${index + 1}`}
                      className="h-20 w-full rounded object-cover"
                    />
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-3">
                {selectedReport.address || `${selectedReport.latitude.toFixed(4)}, ${selectedReport.longitude.toFixed(4)}`}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[1000]">
              <div className="text-lg font-medium">Ładowanie...</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function getMarkerIcon(type: string): string {
  const colors: Record<string, string> = {
    brown_water: '#8B4513',
    bad_smell: '#FFD700',
    sediment: '#A9A9A9',
    pressure: '#FF6347',
    no_water: '#1E90FF',
    other: '#808080',
  };

  const color = colors[type] || '#808080';

  return `
    <svg width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `;
}
```

#### 6.3. Stats Section with RTK Query

**Plik: `src/components/sections/StatsSection.tsx`**
```typescript
import { useGetStatsQuery } from '@/lib/api/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { reportTypes } from '@/lib/utils/validation';

export function StatsSection() {
  const { data, isLoading } = useGetStatsQuery({
    groupBy: 'week',
  });

  if (isLoading) {
    return (
      <section id="stats" className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="text-lg font-medium">Ładowanie statystyk...</div>
        </div>
      </section>
    );
  }

  const typeStats = reportTypes.map(type => ({
    label: type.label,
    count: data?.byType?.[type.value] || 0,
  }));

  return (
    <section id="stats" className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-3xl font-bold text-center">Statystyki</h2>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          <StatsCard title="Wszystkie zgłoszenia" value={data?.totalReports || 0} />
          <StatsCard title="Ostatni tydzień" value={data?.lastWeek || 0} />
          <StatsCard title="Ostatni miesiąc" value={data?.lastMonth || 0} />
          <StatsCard title="Miasta" value={data?.uniqueCities || 0} />
        </div>

        {/* Chart: Reports by type */}
        <div className="mb-12">
          <h3 className="mb-4 text-xl font-semibold">Zgłoszenia według typu problemu</h3>
          <div className="rounded-lg bg-gray-50 p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Reports over time */}
        {data?.timeline && (
          <div>
            <h3 className="mb-4 text-xl font-semibold">Zgłoszenia w czasie</h3>
            <div className="rounded-lg bg-gray-50 p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function StatsCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-primary-600">{value}</p>
    </div>
  );
}
```

### Etap 7: SEO i index.html (Tydzień 5) ⏱️ ~2-3h

#### 7.1. index.html z SEO

**Plik: `index.html`**
```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Primary Meta Tags -->
    <title>Cola z Kranu - Zgłaszanie problemów z wodą w Polsce</title>
    <meta name="title" content="Cola z Kranu - Zgłaszanie problemów z wodą w Polsce" />
    <meta name="description" content="Zgłaszaj i przeglądaj problemy z jakością wody w Polsce. Interaktywna mapa zgłoszeń brunatnej wody, złego zapachu i innych problemów z wodą z kranu." />
    <meta name="keywords" content="woda z kranu, brunatna woda, jakość wody, zgłoszenia, Polska" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://cola-z-kranu.pl/" />
    <meta property="og:title" content="Cola z Kranu - Zgłaszanie problemów z wodą" />
    <meta property="og:description" content="Zgłaszaj i przeglądaj problemy z jakością wody w Polsce" />
    <meta property="og:image" content="https://cola-z-kranu.pl/og-image.png" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://cola-z-kranu.pl/" />
    <meta property="twitter:title" content="Cola z Kranu - Zgłaszanie problemów z wodą" />
    <meta property="twitter:description" content="Zgłaszaj i przeglądaj problemy z jakością wody w Polsce" />
    <meta property="twitter:image" content="https://cola-z-kranu.pl/og-image.png" />

    <!-- Noscript fallback -->
    <noscript>
      <style>
        #root { display: none; }
        .noscript-message {
          display: block;
          padding: 2rem;
          text-align: center;
          font-family: system-ui, -apple-system, sans-serif;
        }
      </style>
      <div class="noscript-message">
        <h1>Cola z Kranu</h1>
        <p>Ta aplikacja wymaga JavaScript. Proszę włączyć JavaScript w przeglądarce.</p>
      </div>
    </noscript>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## 3. Podsumowanie Timeline

| Etap | Czas | Zadania |
|------|------|---------|
| Etap 1: Setup | 5-7h | Vite + React + Redux + Tailwind + shadcn/ui setup + OpenAPI tools |
| Etap 2: Struktura | 4-6h | One-pager structure + Sections + Smooth scroll navigation |
| Etap 3: API Client | 5-6h | RTK Query + OpenAPI code generation + Redux store |
| Etap 4: UI Components | 4-6h | Instalacja i customizacja shadcn/ui komponentów |
| Etap 5: Formularz | 10-12h | Report form + validation + multi-type + multi-photo (shadcn/ui) |
| Etap 6: Mapa | 14-18h | Leaflet + clustering + filters + RTK Query integration |
| Etap 7: SEO | 2-3h | index.html optimization |
| **RAZEM** | **44-58h** | ~1.5-2 miesiące (part-time) |

**Oszczędność czasu dzięki shadcn/ui:** ~3-5h (gotowe komponenty zamiast budowania od zera)

## 4. Best Practices

### 4.1. Konwencje Kodu
- TypeScript strict mode
- Functional components + hooks
- Named exports dla komponentów
- Folder structure: feature-based
- CSS: Tailwind utility-first

### 4.2. State Management
- **Redux Toolkit + RTK Query** dla API state management
- Automatyczne cache i refetch przez RTK Query
- Keep UI state as local as possible (React useState)
- Custom hooks dla reusable logic
- Tags dla cache invalidation (`Report`, `Stats`)

### 4.3. Performance
- Code splitting przez React.lazy
- Memo dla expensive components
- Debounce dla search inputs
- Optimize bundle size (analyze with vite-bundle-visualizer)
- RTK Query automatic caching reduces redundant API calls

### 4.4. OpenAPI Development Workflow

**Workflow podczas developmentu:**

1. **Backend zmienia API** → Aktualizuje specyfikację OpenAPI w `api/openapi/openapi.yaml`
2. **Generuj typy** → Uruchom `npm run openapi:generate-client` w `website/`
3. **Typy TypeScript zaktualizowane** → Plik `src/lib/api/generated/schema.ts` zawiera nowe typy
4. **TypeScript errors** → Jeśli API się zmieniło, TypeScript wskaże wszystkie miejsca wymagające aktualizacji
5. **Aktualizuj komponenty** → Popraw komponenty zgodnie z nowymi typami

**Zalety tego podejścia:**
- ✅ **Type safety**: Automatyczna synchronizacja typów między backend i frontend
- ✅ **Catch errors early**: TypeScript wyłapuje niezgodności w compile time, nie w runtime
- ✅ **Auto-complete**: IDE podpowiada dostępne pola i endpointy
- ✅ **Single source of truth**: OpenAPI spec jest źródłem prawdy o API
- ✅ **Documentation**: OpenAPI spec służy też jako dokumentacja API

**Przykład:**
```bash
# Backend developer dodaje nowe pole "urgency" do Report
# 1. Aktualizuje openapi.yaml
# 2. Frontend developer generuje typy:
cd website
npm run openapi:generate-client

# 3. TypeScript automatycznie pokazuje błędy w komponentach używających Report
# 4. Developer aktualizuje komponenty, dodając obsługę "urgency"
```

---

**Dokument utworzony**: 2025-11-19
**Wersja**: 3.1 (zaktualizowano: shadcn/ui + Tailwind CSS, RTK Query + OpenAPI, one-pager architecture, multi-photo, multi-type)
**Status**: Ready for implementation
