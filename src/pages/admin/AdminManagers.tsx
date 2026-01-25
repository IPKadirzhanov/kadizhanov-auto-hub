import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trophy, Users, Star } from 'lucide-react';
import { toast } from 'sonner';

const AdminManagers = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const { data: managers, isLoading } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'manager');
      
      if (!roles?.length) return [];

      const userIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);

      // Get scores
      const { data: scores } = await supabase
        .from('manager_scores')
        .select('manager_id, points')
        .in('manager_id', userIds);

      // Get reviews for average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('manager_id, rating')
        .in('manager_id', userIds)
        .eq('is_approved', true);

      const scoresByManager = scores?.reduce((acc, s) => {
        acc[s.manager_id] = (acc[s.manager_id] || 0) + s.points;
        return acc;
      }, {} as Record<string, number>) || {};

      const reviewsByManager = reviews?.reduce((acc, r) => {
        if (!acc[r.manager_id]) acc[r.manager_id] = { total: 0, count: 0 };
        acc[r.manager_id].total += r.rating;
        acc[r.manager_id].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>) || {};

      // Get lead stats per manager
      const { data: leads } = await supabase
        .from('leads')
        .select('assigned_manager_id, status')
        .in('assigned_manager_id', userIds);

      const leadsByManager = leads?.reduce((acc, l) => {
        if (!l.assigned_manager_id) return acc;
        if (!acc[l.assigned_manager_id]) acc[l.assigned_manager_id] = { total: 0, won: 0 };
        acc[l.assigned_manager_id].total += 1;
        if (l.status === 'closed_won') acc[l.assigned_manager_id].won += 1;
        return acc;
      }, {} as Record<string, { total: number; won: number }>) || {};

      return profiles?.map(p => ({
        ...p,
        total_points: scoresByManager[p.user_id] || 0,
        avg_rating: reviewsByManager[p.user_id] 
          ? (reviewsByManager[p.user_id].total / reviewsByManager[p.user_id].count).toFixed(1) 
          : null,
        review_count: reviewsByManager[p.user_id]?.count || 0,
        leads_total: leadsByManager[p.user_id]?.total || 0,
        leads_won: leadsByManager[p.user_id]?.won || 0,
      })).sort((a, b) => b.total_points - a.total_points) || [];
    }
  });

  const createManager = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-manager', {
        body: { email, password, fullName }
      });
      
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success('Менеджер добавлен');
      setIsDialogOpen(false);
      setEmail('');
      setPassword('');
      setFullName('');
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
    onError: (e) => toast.error('Ошибка: ' + (e as Error).message)
  });

  return (
    <DashboardLayout title="Менеджеры">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-muted-foreground">Всего: {managers?.length || 0}</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground">
                <Plus className="w-4 h-4" /> Добавить менеджера
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новый менеджер</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Имя</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Иван Иванов" />
                </div>
                <div className="space-y-2">
                  <Label>Email (логин)</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="manager@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Пароль</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Минимум 6 символов" />
                </div>
                <Button 
                  onClick={() => createManager.mutate()} 
                  disabled={createManager.isPending || !email || !password || !fullName} 
                  className="w-full"
                >
                  {createManager.isPending ? 'Создание...' : 'Создать менеджера'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-secondary animate-pulse rounded-xl" />)}
          </div>
        ) : managers?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Менеджеров пока нет. Нажмите «Добавить менеджера» чтобы создать первого.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managers?.map((manager: any, index) => (
              <Card key={manager.id} className="glass-card">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold">
                        {manager.full_name?.charAt(0) || '?'}
                      </div>
                      {index < 3 && (
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                        }`}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold">{manager.full_name || 'Без имени'}</h3>
                      
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-bold">{manager.total_points}</span>
                        <span className="text-sm text-muted-foreground">очков</span>
                      </div>
                      
                      {manager.avg_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{manager.avg_rating}</span>
                          <span className="text-sm text-muted-foreground">({manager.review_count} отзывов)</span>
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        Заявок: {manager.leads_total} | Продаж: {manager.leads_won}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminManagers;
