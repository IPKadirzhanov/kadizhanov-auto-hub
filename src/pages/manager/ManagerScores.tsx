import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, Star, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ManagerScores = () => {
  const { user } = useAuth();

  const { data: scores, isLoading } = useQuery({
    queryKey: ['manager-scores', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manager_scores')
        .select('*')
        .eq('manager_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const totalPoints = scores?.reduce((sum, s) => sum + s.points, 0) || 0;
  const salesCount = scores?.filter(s => s.action_type === 'sale').length || 0;
  const reviewsCount = scores?.filter(s => s.action_type === 'review').length || 0;

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'sale':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'review':
        return <Star className="w-4 h-4 text-yellow-500" />;
      default:
        return <Trophy className="w-4 h-4 text-primary" />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'sale':
        return 'bg-green-500/10 text-green-500';
      case 'review':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <DashboardLayout title="Мои очки">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Всего очков</p>
                  <p className="text-3xl font-bold">{totalPoints}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Продажи</p>
                  <p className="text-3xl font-bold">{salesCount}</p>
                  <p className="text-xs text-muted-foreground">+100 очков каждая</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Отзывы</p>
                  <p className="text-3xl font-bold">{reviewsCount}</p>
                  <p className="text-xs text-muted-foreground">10 очков за звезду</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              История начислений
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-secondary animate-pulse rounded-lg" />
                ))}
              </div>
            ) : scores?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Пока нет начислений</p>
                <p className="text-sm">Закрывайте сделки и получайте отзывы!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scores?.map(score => (
                  <div 
                    key={score.id} 
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(score.action_type)}`}>
                        {getActionIcon(score.action_type)}
                      </div>
                      <div>
                        <p className="font-medium">{score.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(score.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary">+{score.points}</span>
                      <p className="text-xs text-muted-foreground">очков</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerScores;
