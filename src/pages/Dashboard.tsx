import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeadStats } from '@/hooks/useLeads';
import { useCars } from '@/hooks/useCars';
import { Car, FileText, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { isAdmin, profile } = useAuth();
  const { data: leadStats } = useLeadStats();
  const { data: cars } = useCars();

  const stats = [
    { 
      title: 'Всего авто', 
      value: cars?.length || 0, 
      icon: Car,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    { 
      title: 'Заявки', 
      value: leadStats?.total || 0, 
      icon: FileText,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    { 
      title: 'Новые заявки', 
      value: leadStats?.new || 0, 
      icon: TrendingUp,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    },
    { 
      title: 'Продажи', 
      value: leadStats?.won || 0, 
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
  ];

  return (
    <DashboardLayout title="Панель управления">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Добро пожаловать, {profile?.full_name || 'Пользователь'}!
          </h2>
          <p className="text-muted-foreground">
            {isAdmin ? 'Вы вошли как администратор' : 'Вы вошли как менеджер'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isAdmin && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <a href="/admin/cars" className="p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-smooth text-center">
                  <Car className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <span className="text-sm">Добавить авто</span>
                </a>
                <a href="/admin/leads" className="p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-smooth text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <span className="text-sm">Просмотр заявок</span>
                </a>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Статус заявок</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Новые</span>
                    <span className="font-medium">{leadStats?.new || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">В работе</span>
                    <span className="font-medium">{leadStats?.inProgress || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Закрыты</span>
                    <span className="font-medium">{leadStats?.closed || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
