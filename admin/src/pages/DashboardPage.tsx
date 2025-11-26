import { useGetStatsQuery, useGetReportsQuery } from '@/lib/api/generatedApi';
import { REPORT_TYPE_LABELS, formatDate } from '@/lib/utils/utils';

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetStatsQuery('month');
  const { data: reports, isLoading: reportsLoading } = useGetReportsQuery({ limit: 5 });

  if (statsLoading || reportsLoading) {
    return <div className="text-muted-foreground">Ladowanie...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">Wszystkie zgloszenia</p>
          <p className="text-3xl font-bold">{stats?.total ?? 0}</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">Ostatnie 24h</p>
          <p className="text-3xl font-bold">{stats?.recentCount ?? 0}</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">Typy problemow</p>
          <p className="text-3xl font-bold">{Object.keys(stats?.byType ?? {}).length}</p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">Miasta</p>
          <p className="text-3xl font-bold">{stats?.byCity?.length ?? 0}</p>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted/50">
          <h2 className="font-semibold">Ostatnie zgloszenia</h2>
        </div>
        <div className="divide-y">
          {reports?.reports.map((report) => (
            <div key={report.uuid} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {report.types.map((t) => REPORT_TYPE_LABELS[t]).join(', ')}
                </p>
                <p className="text-sm text-muted-foreground">{report.city ?? 'Nieznane miasto'}</p>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(report.reportedAt)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
