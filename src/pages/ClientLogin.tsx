import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogIn, Mail, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ClientLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if user has admin/manager role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id);

      if (roles && roles.length > 0) {
        // User is admin or manager, redirect to dashboard
        toast.success('Добро пожаловать!');
        navigate('/dashboard');
      } else {
        // Regular client
        toast.success('Добро пожаловать!');
        navigate('/client');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Неверный email или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-12 max-w-md mx-auto">
        <Card className="glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Вход для клиентов</CardTitle>
            <CardDescription>
              Войдите чтобы отслеживать свои заявки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@example.com"
                    className="pl-10 bg-secondary border-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Ваш пароль"
                    className="pl-10 bg-secondary border-0"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm space-y-2">
              <div>
                <span className="text-muted-foreground">Нет аккаунта? </span>
                <Link to="/client/register" className="text-primary hover:underline">
                  Зарегистрироваться
                </Link>
              </div>
              <div>
                <Link to="/login" className="text-muted-foreground hover:text-primary text-xs">
                  Вход для сотрудников →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ClientLogin;
