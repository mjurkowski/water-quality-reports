import { useState } from 'react';
import { useGetStatsQuery } from '@/lib/api/generatedApi';
import { REPORT_TYPE_LABELS } from '@/lib/utils/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
const periods = [
  { value: 'week', label: 'Tydzien' },
  { value: 'month', label: 'Miesiac' },
  { value: 'year', label: 'Rok' },
  { value: 'all', label: 'Wszystko' },
];

export function StatsPage() {
  const [period, setPeriod] = useState('month');
  const { data: stats, isLoading } = useGetStatsQuery(period);

  if (isLoading) {
    return <div className="text-muted-foreground">Ladowanie...</div>;
  }

  if (!stats) return null;

  const typeData = Object.entries(stats.byType).map(([type, count]) => ({
    name: REPORT_TYPE_LABELS[type] || type,
    value: count,
  }));

  const cityData = stats.byCity.slice(0, 10).map((item) => ({
    name: item.city,
    count: item.count,
  }));

  const voivodeshipData = stats.byVoivodeship.map((item) => ({
    name: item.voivodeship,
    count: item.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Statystyki</h1>
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 rounded text-sm border ${
                period === p.value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Wszystkie zgloszenia</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Ostatnie 24h</p>
          <p className="text-3xl font-bold">{stats.recentCount}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Miast</p>
          <p className="text-3xl font-bold">{stats.byCity.length}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Zgloszenia wg typu</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {typeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Top 10 miast</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border rounded-lg p-4 md:col-span-2">
          <h3 className="font-semibold mb-4">Zgloszenia wg wojewodztw</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={voivodeshipData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
