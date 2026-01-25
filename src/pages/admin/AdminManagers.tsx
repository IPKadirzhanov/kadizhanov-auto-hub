import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trophy, Star, Users } from 'lucide-react';
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

      const scoresByManager = scores?.reduce((acc, s) => {
        acc[s.manager_id] = (acc[s.manager_id] || 0) + s.points;
        return acc;
      }, {} as Record<string, number>) || {};

      return profiles?.map(p => ({
        ...p,
        total_points: scoresByManager[p.user_id] || 0
      })).sort((a, b) => b.total_points - a.total_points) || [];
    }
  });

  const createManager = useMutation({
    mutationFn: async () => {
      // Create user via edge function would be ideal, for now show instructions
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) throw error;
      if (!data.user) throw new Error('User not created');

      // Add manager role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: data.user.id, role: 'manager' });
      
      if (roleError) throw roleError;
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
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Пароль</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button onClick={() => createManager.mutate()} disabled={createManager.isPending} className="w-full">
                  {createManager.isPending ? 'Создание...' : 'Создать'}
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
          <div className="text-center py-12 text-muted-foreground">Менеджеров пока нет</div>
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
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                        }`}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{manager.full_name || 'Без имени'}</h3>
                      <p className="text-sm text-muted-foreground">{manager.phone || 'Нет телефона'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-bold text-gold-gradient">{manager.total_points}</span>
                        <span className="text-sm text-muted-foreground">очков</span>
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
