import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeadStats } from '@/hooks/useLeads';
import { useCars } from '@/hooks/useCars';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminAnalytics = () => {
  const { data: leadStats } = useLeadStats();
  const { data: cars } = useCars();

  const statusData = [
    { name: 'Новые', value: leadStats?.new || 0 },
    { name: 'В работе', value: leadStats?.inProgress || 0 },
    { name: 'Продажи', value: leadStats?.won || 0 },
  ];

  const carsByMake = cars?.reduce((acc, car) => {
    acc[car.make] = (acc[car.make] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const makeData = Object.entries(carsByMake).map(([name, value]) => ({ name, value })).slice(0, 8);

  const COLORS = ['hsl(38, 92%, 50%)', 'hsl(142, 71%, 45%)', 'hsl(217, 91%, 60%)', 'hsl(0, 72%, 51%)'];

  return (
    <DashboardLayout title="Аналитика">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Статусы заявок</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Авто по маркам</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={makeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="value" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Ключевые метрики</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-gold-gradient">{cars?.length || 0}</p>
                <p className="text-muted-foreground">Всего авто</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gold-gradient">{cars?.filter(c => c.status === 'available').length || 0}</p>
                <p className="text-muted-foreground">В наличии</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gold-gradient">{leadStats?.total || 0}</p>
                <p className="text-muted-foreground">Всего заявок</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gold-gradient">
                  {leadStats?.total ? Math.round((leadStats.won / leadStats.total) * 100) : 0}%
                </p>
                <p className="text-muted-foreground">Конверсия</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
