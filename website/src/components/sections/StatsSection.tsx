import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetStatsQuery } from '@/lib/api/generatedApi';
import { REPORT_TYPE_LABELS } from '@/lib/utils/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function StatsSection() {
  const { data: stats, isLoading } = useGetStatsQuery({ period: 'month' });

  if (isLoading) {
    return (
      <section id="stats" className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8 text-center">Statystyki</h2>
          <p className="text-center text-muted-foreground">Ladowanie...</p>
        </div>
      </section>
    );
  }

  if (!stats || !stats.byType || !stats.byCity) return null;

  const typeData = Object.entries(stats.byType).map(([type, count]) => ({
    name: REPORT_TYPE_LABELS[type] || type,
    value: count,
  }));

  const cityData = stats.byCity.slice(0, 5).map((item) => ({
    name: item.city,
    count: item.count,
  }));

  return (
    <section id="stats" className="py-16 bg-muted/30">
      <div className="container">
        <h2 className="text-3xl font-bold mb-8 text-center">Statystyki zgloszen</h2>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Wszystkie zgloszenia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Ostatnie 24h</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.recentCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Okres</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold capitalize">{stats.period === 'month' ? 'Miesiac' : stats.period}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Zgloszenia wg typu</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 miast</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
