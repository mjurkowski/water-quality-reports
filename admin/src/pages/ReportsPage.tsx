import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAdminReportsQuery } from '@/lib/api/generatedApi';
import { REPORT_TYPE_LABELS, formatDate } from '@/lib/utils/utils';

type SortField = 'reportedAt' | 'createdAt' | 'city';
type SortOrder = 'asc' | 'desc';

const REPORT_TYPES = [
  { value: 'brown_water', label: 'Brunatna woda' },
  { value: 'bad_smell', label: 'Nieprzyjemny zapach' },
  { value: 'sediment', label: 'Osad/zawiesiny' },
  { value: 'pressure', label: 'Niskie ciśnienie' },
  { value: 'no_water', label: 'Brak wody' },
  { value: 'other', label: 'Inne' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Wszystkie' },
  { value: 'active', label: 'Aktywne' },
  { value: 'deleted', label: 'Usunięte' },
  { value: 'spam', label: 'Spam' },
];

export function ReportsPage() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    types: '',
    city: '',
  });
  const [sortField, setSortField] = useState<SortField>('reportedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const limit = 20;

  const { data, isLoading } = useGetAdminReportsQuery({
    limit,
    offset: page * limit,
    status: filters.status || undefined,
    types: filters.types || undefined,
    city: filters.city || undefined,
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Ładowanie...</div>;
  }

  // Client-side sorting (since API doesn't support sorting yet)
  const sortedReports = [...(data?.reports || [])].sort((a, b) => {
    let aVal, bVal;

    if (sortField === 'reportedAt' || sortField === 'createdAt') {
      aVal = new Date(a[sortField]).getTime();
      bVal = new Date(b[sortField]).getTime();
    } else if (sortField === 'city') {
      aVal = a.city || '';
      bVal = b.city || '';
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil((data?.total ?? 0) / limit);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      deleted: 'bg-red-100 text-red-800',
      spam: 'bg-orange-100 text-orange-800',
    };

    const labels = {
      active: 'Aktywne',
      deleted: 'Usunięte',
      spam: 'Spam',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Zgłoszenia</h1>

      {/* Filters */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <h2 className="text-sm font-semibold mb-3">Filtry</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(0);
              }}
              className="w-full p-2 border rounded text-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Typ problemu</label>
            <select
              value={filters.types}
              onChange={(e) => {
                setFilters({ ...filters, types: e.target.value });
                setPage(0);
              }}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="">Wszystkie</option>
              {REPORT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Miasto</label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => {
                setFilters({ ...filters, city: e.target.value });
                setPage(0);
              }}
              placeholder="Wpisz miasto..."
              className="w-full p-2 border rounded text-sm"
            />
          </div>
        </div>

        {(filters.status || filters.types || filters.city) && (
          <button
            onClick={() => {
              setFilters({ status: '', types: '', city: '' });
              setPage(0);
            }}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Wyczyść filtry
          </button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Typy</th>
              <th
                className="text-left p-3 font-medium cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort('city')}
              >
                Miasto {getSortIcon('city')}
              </th>
              <th className="text-left p-3 font-medium">Województwo</th>
              <th
                className="text-left p-3 font-medium cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort('reportedAt')}
              >
                Data zgłoszenia {getSortIcon('reportedAt')}
              </th>
              <th
                className="text-left p-3 font-medium cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort('createdAt')}
              >
                Data utworzenia {getSortIcon('createdAt')}
              </th>
              <th className="text-left p-3 font-medium">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  Brak zgłoszeń spełniających kryteria
                </td>
              </tr>
            ) : (
              sortedReports.map((report) => (
                <tr key={report.uuid} className="hover:bg-muted/30">
                  <td className="p-3">
                    {getStatusBadge(report.status || 'active')}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {report.types.map((t) => (
                        <span key={t} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {REPORT_TYPE_LABELS[t] || t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3">{report.city || '-'}</td>
                  <td className="p-3">{report.voivodeship || '-'}</td>
                  <td className="p-3 text-sm">{formatDate(report.reportedAt)}</td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {formatDate(report.createdAt)}
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/reports/${report.uuid}`}
                      className="text-primary hover:underline text-sm"
                    >
                      Szczegóły
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Pokazano {sortedReports.length} z {data?.total ?? 0} zgłoszeń
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            Poprzednia
          </button>
          <span className="px-3 py-1 text-sm">
            {page + 1} / {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            Następna
          </button>
        </div>
      </div>
    </div>
  );
}
