# Implementacja Admin Panel - React + Vite + Routing

## 1. Przegląd

### 1.1. Stack Technologiczny Admin Panel
- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Language**: TypeScript
- **API Client**: RTK Query + OpenAPI generated types
- **Forms**: React Hook Form + Zod
- **Styling**: shadcn/ui + Tailwind CSS
- **Charts**: Recharts
- **Tables**: TanStack Table v8 (shadcn/ui data-table)

### 1.2. Architektura Admin Panel

Panel administracyjny to osobna aplikacja React z pełnym routingiem, służąca do zarządzania zgłoszeniami i moderacji.

```
Admin Panel Features:
├── Dashboard (Overview)
│   ├── Statystyki (zgłoszenia, typy, regiony)
│   ├── Ostatnie zgłoszenia
│   └── Wykresy trendów
├── Reports Management
│   ├── Lista wszystkich zgłoszeń (z paginacją)
│   ├── Filtry zaawansowane
│   ├── Szczegóły zgłoszenia
│   ├── Edycja zgłoszenia
│   └── Usuwanie zgłoszenia
├── Statistics & Analytics
│   ├── Wykresy czasowe
│   ├── Mapa cieplna
│   └── Eksport danych (CSV)
└── Settings
    ├── Konfiguracja systemu
    └── Moderacja (przyszłość)
```

## 2. Etapy Implementacji

### Etap 1: Setup Projektu (Tydzień 1) ⏱️ ~4h

#### 1.1. Inicjalizacja Projektu

```bash
# W katalogu głównym repozytorium
mkdir admin
cd admin

# Inicjalizacja Vite + React + TypeScript
npm create vite@latest . -- --template react-ts

# Instalacja zależności
npm install

# Instalacja dodatkowych pakietów
npm install react-router-dom @reduxjs/toolkit react-redux
npm install react-hook-form @hookform/resolvers zod
npm install recharts date-fns clsx tailwind-merge

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui setup
npx shadcn-ui@latest init

# Odpowiedz na pytania podczas instalacji:
# - TypeScript: yes
# - Style: Default
# - Base color: Slate
# - CSS variables: yes
# - Tailwind config: Yes (use tailwind.config.js)
# - Components directory: src/components
# - Utils directory: src/lib/utils
# - React Server Components: no
# - Write configuration: yes

# Dodaj często używane komponenty dla admin panelu
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add label
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar

# Dev dependencies
npm install -D @types/node
npm install -D openapi-typescript
```

#### 1.2. Konfiguracja Vite

**Plik: `admin/vite.config.ts`**
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
    port: 5174, // Different port from website (5173)
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
  },
});
```

#### 1.3. Package.json Scripts

**Plik: `admin/package.json`**
```json
{
  "name": "water-reports-admin",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5174",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "test": "vitest",
    "openapi:generate-client": "openapi-typescript ../api/openapi/openapi.yaml -o src/lib/api/generated/schema.ts"
  }
}
```

### Etap 2: Routing Setup (Tydzień 1) ⏱️ ~3h

#### 2.1. Router Configuration

**Plik: `admin/src/App.tsx`**
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:uuid" element={<ReportDetailPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

#### 2.2. Admin Layout Component

**Plik: `admin/src/components/layout/AdminLayout.tsx`**
```typescript
import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

#### 2.3. Sidebar Navigation

**Plik: `admin/src/components/layout/Sidebar.tsx`**
```typescript
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Zgłoszenia', href: '/reports', icon: '📋' },
  { name: 'Statystyki', href: '/stats', icon: '📈' },
  { name: 'Ustawienia', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex w-64 flex-col bg-gray-800">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-white">
          Cola z Kranu - Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={clsx(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium',
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

### Etap 3: RTK Query API Setup (Tydzień 1-2) ⏱️ ~6h

#### 3.1. Redux Store Configuration

**Plik: `admin/src/lib/api/store.ts`**
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

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### 3.2. RTK Query API

**Plik: `admin/src/lib/api/api.ts`**
```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { paths } from './generated/schema';

// Type helpers from OpenAPI schema
type ReportListResponse = paths['/api/reports']['get']['responses'][200]['content']['application/json'];
type ReportResponse = paths['/api/reports/{uuid}']['get']['responses'][200]['content']['application/json'];
type CreateReportRequest = paths['/api/reports']['post']['requestBody']['content']['application/json'];

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || '/api',
  }),
  tagTypes: ['Report', 'Stats'],
  endpoints: (builder) => ({
    // Get all reports with filters
    getReports: builder.query<ReportListResponse, {
      bounds?: string;
      type?: string | string[];
      startDate?: string;
      endDate?: string;
      city?: string;
      limit?: number;
      status?: string; // Admin can see all statuses
    }>({
      query: (params) => ({
        url: '/reports',
        params,
      }),
      providesTags: ['Report'],
    }),

    // Get single report by UUID
    getReport: builder.query<ReportResponse, string>({
      query: (uuid) => `/reports/${uuid}`,
      providesTags: (result, error, uuid) => [{ type: 'Report', id: uuid }],
    }),

    // Update report (admin only)
    updateReport: builder.mutation<void, {
      uuid: string;
      data: Partial<CreateReportRequest>;
    }>({
      query: ({ uuid, data }) => ({
        url: `/reports/${uuid}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { uuid }) => [
        { type: 'Report', id: uuid },
        'Report',
      ],
    }),

    // Delete report (admin only)
    deleteReport: builder.mutation<void, string>({
      query: (uuid) => ({
        url: `/reports/${uuid}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Report'],
    }),

    // Get statistics
    getStats: builder.query<any, {
      startDate?: string;
      endDate?: string;
      groupBy?: 'day' | 'week' | 'month';
    }>({
      query: (params) => ({
        url: '/stats',
        params,
      }),
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useGetReportQuery,
  useUpdateReportMutation,
  useDeleteReportMutation,
  useGetStatsQuery,
} = api;
```

#### 3.3. Provider Setup

**Plik: `admin/src/main.tsx`**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './lib/api/store';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

### Etap 4: Dashboard Page (Tydzień 2) ⏱️ ~8h

#### 4.1. Dashboard Component

**Plik: `admin/src/pages/DashboardPage.tsx`**
```typescript
import { useGetReportsQuery, useGetStatsQuery } from '@/lib/api/api';
import StatsCard from '@/components/stats/StatsCard';
import RecentReportsTable from '@/components/tables/RecentReportsTable';
import TrendChart from '@/components/stats/TrendChart';

export default function DashboardPage() {
  const { data: reportsData, isLoading: reportsLoading } = useGetReportsQuery({
    limit: 10,
  });

  const { data: statsData, isLoading: statsLoading } = useGetStatsQuery({
    groupBy: 'day',
  });

  if (reportsLoading || statsLoading) {
    return <div>Ładowanie...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Przegląd aktywności i statystyk systemu
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Wszystkie zgłoszenia"
          value={statsData?.totalReports || 0}
          change="+12.5%"
          trend="up"
        />
        <StatsCard
          title="Ostatni tydzień"
          value={statsData?.lastWeek || 0}
          change="+5.2%"
          trend="up"
        />
        <StatsCard
          title="Aktywne"
          value={statsData?.active || 0}
          change="-2.3%"
          trend="down"
        />
        <StatsCard
          title="Usunięte"
          value={statsData?.deleted || 0}
          change="+1.1%"
          trend="neutral"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium">Zgłoszenia w czasie</h2>
          <TrendChart data={statsData?.timeline || []} />
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium">Typy problemów</h2>
          {/* Pie chart or bar chart */}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-medium">Ostatnie zgłoszenia</h2>
        <RecentReportsTable reports={reportsData?.reports || []} />
      </div>
    </div>
  );
}
```

### Etap 5: Reports Management (Tydzień 2-3) ⏱️ ~12h

#### 5.1. Reports List Page

**Plik: `admin/src/pages/ReportsPage.tsx`**
```typescript
import { useState } from 'react';
import { useGetReportsQuery } from '@/lib/api/api';
import { Link } from 'react-router-dom';
import ReportsTable from '@/components/tables/ReportsTable';
import ReportsFilters from '@/components/forms/ReportsFilters';

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    type: undefined,
    city: undefined,
    status: 'active',
  });

  const { data, isLoading, error } = useGetReportsQuery(filters);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zgłoszenia</h1>
          <p className="mt-2 text-sm text-gray-600">
            Zarządzaj wszystkimi zgłoszeniami w systemie
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-6 shadow">
        <ReportsFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {/* Reports Table */}
      <div className="rounded-lg bg-white shadow">
        {isLoading ? (
          <div className="p-6">Ładowanie...</div>
        ) : error ? (
          <div className="p-6 text-red-600">Błąd ładowania danych</div>
        ) : (
          <ReportsTable reports={data?.reports || []} />
        )}
      </div>
    </div>
  );
}
```

#### 5.2. Reports Table Component

**Plik: `admin/src/components/tables/ReportsTable.tsx`**
```typescript
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Report {
  uuid: string;
  types: string[];
  address?: string;
  city?: string;
  reportedAt: string;
  status: string;
}

interface Props {
  reports: Report[];
}

export default function ReportsTable({ reports }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Data
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Typ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Lokalizacja
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Akcje
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {reports.map((report) => (
            <tr key={report.uuid} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {format(new Date(report.reportedAt), 'dd MMM yyyy', { locale: pl })}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {report.types.join(', ')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {report.city || 'Brak danych'}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    report.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {report.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <Link
                  to={`/reports/${report.uuid}`}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Szczegóły
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Etap 6: Report Detail & Edit (Tydzień 3) ⏱️ ~10h

#### 6.1. Report Detail Page

**Plik: `admin/src/pages/ReportDetailPage.tsx`**
```typescript
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  useGetReportQuery,
  useUpdateReportMutation,
  useDeleteReportMutation,
} from '@/lib/api/api';
import ReportEditForm from '@/components/forms/ReportEditForm';

export default function ReportDetailPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const { data: report, isLoading } = useGetReportQuery(uuid!);
  const [updateReport] = useUpdateReportMutation();
  const [deleteReport] = useDeleteReportMutation();

  const handleUpdate = async (data: any) => {
    await updateReport({ uuid: uuid!, data });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (confirm('Czy na pewno chcesz usunąć to zgłoszenie?')) {
      await deleteReport(uuid!);
      navigate('/reports');
    }
  };

  if (isLoading) {
    return <div>Ładowanie...</div>;
  }

  if (!report) {
    return <div>Zgłoszenie nie znalezione</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Zgłoszenie #{report.uuid.slice(0, 8)}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {isEditing ? 'Anuluj' : 'Edytuj'}
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Usuń
          </button>
        </div>
      </div>

      {/* Report Details or Edit Form */}
      {isEditing ? (
        <ReportEditForm report={report} onSubmit={handleUpdate} />
      ) : (
        <div className="rounded-lg bg-white p-6 shadow">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Typy problemów</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {report.types.join(', ')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Data zgłoszenia</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(report.reportedAt).toLocaleString('pl-PL')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Lokalizacja</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {report.address || `${report.latitude}, ${report.longitude}`}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.status}</dd>
            </div>
            {report.description && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Opis</dt>
                <dd className="mt-1 text-sm text-gray-900">{report.description}</dd>
              </div>
            )}
            {report.photos && report.photos.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Zdjęcia</dt>
                <dd className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {report.photos.map((photo: any) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt="Zdjęcie zgłoszenia"
                      className="h-32 w-full rounded object-cover"
                    />
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
```

## 3. Deployment

Admin panel jest deployowany jako osobna aplikacja na subdomenę `admin.cola-z-kranu.pl`.

### 3.1. Build Process

```bash
# W katalogu admin/
npm run build

# Pliki generowane w admin/dist/
```

### 3.2. Deployment na myDevil

1. **Utwórz subdomenę w panelu myDevil**:
   - Nazwa: `admin.cola-z-kranu.pl`
   - Katalog: `/domains/admin.cola-z-kranu.pl/public_html`

2. **Deploy przez rsync** (w GitHub Actions lub ręcznie):
```bash
rsync -avz --delete \
  -e "ssh -o StrictHostKeyChecking=no" \
  ./admin/dist/ \
  m1234@s84.mydevil.net:/home/m1234/domains/admin.cola-z-kranu.pl/public_html/
```

## 4. Bezpieczeństwo Admin Panel

### 4.1. Autentykacja (Future Implementation)

W przyszłości admin panel powinien być chroniony przez:

- **Basic Auth** (tymczasowo przez Nginx/Apache)
- **JWT Authentication** (docelowo)
- **Role-based Access Control**

**Tymczasowa konfiguracja Basic Auth (.htaccess)**:
```apache
AuthType Basic
AuthName "Admin Panel - Cola z Kranu"
AuthUserFile /home/m1234/.htpasswd
Require valid-user
```

Utworzenie użytkownika:
```bash
htpasswd -c /home/m1234/.htpasswd admin
```

## 5. Podsumowanie Timeline

| Etap | Czas | Zadania |
|------|------|---------|
| Etap 1: Setup | 4h | Vite + React + TypeScript + dependencies |
| Etap 2: Routing | 3h | React Router + Layout + Navigation |
| Etap 3: RTK Query | 6h | Redux store + API client + OpenAPI types |
| Etap 4: Dashboard | 8h | Stats cards + charts + recent reports |
| Etap 5: Reports List | 12h | Table + filters + pagination |
| Etap 6: Detail & Edit | 10h | Detail view + edit form + delete |
| **RAZEM** | **43h** | ~2 miesiące (part-time) |

---

**Dokument utworzony**: 2025-11-19
**Wersja**: 1.0
**Status**: Ready for implementation
