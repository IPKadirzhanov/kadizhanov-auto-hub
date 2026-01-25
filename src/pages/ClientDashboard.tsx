import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Car, User, Phone, Star, Clock, 
  FileText, LogOut, MessageSquare, ExternalLink 
} from 'lucide-react';
import { LEAD_STATUSES } from '@/lib/constants';
import { toast } from 'sonner';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut, isAdmin, isManager } = useAuth();

  // Redirect admins/managers to their dashboard
  useEffect(() => {
    if (!authLoading && (isAdmin || isManager)) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, isAdmin, isManager, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/client/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Fetch client's leads
  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ['client-leads', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          customer_name,
          status,
          assigned_manager_id,
          rating_token,
          created_at,
          cars (
            id,
            make,
            model,
            year,
            public_price,
            images
          )
        `)
        .eq('client_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch manager info for each lead
      const leadsWithManagers = await Promise.all(
        (data || []).map(async (lead) => {
          let manager = null;
          if (lead.assigned_manager_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, phone')
              .eq('user_id', lead.assigned_manager_id)
              .maybeSingle();
            manager = profile;
          }

          // Check if reviewed
          const { data: review } = await supabase
            .from('reviews')
            .select('id, rating')
            .eq('lead_id', lead.id)
            .maybeSingle();

          return { ...lead, manager, review };
        })
      );

      return leadsWithManagers;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success('Вы вышли из аккаунта');
    navigate('/');
  };

  if (authLoading || !user) {
    return (
      <MainLayout>
        <div className="container py-20 flex justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Личный кабинет</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            Выйти
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Мои заявки
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leadsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-32 bg-secondary animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : leads && leads.length > 0 ? (
                <div className="space-y-4">
                  {leads.map((lead) => {
                    const status = LEAD_STATUSES[lead.status as keyof typeof LEAD_STATUSES];
                    const car = lead.cars;

                    return (
                      <div 
                        key={lead.id} 
                        className="bg-secondary/50 rounded-lg p-4 space-y-4"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <Badge className={`${status?.color} text-white`}>
                            {status?.label || lead.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(lead.created_at).toLocaleDateString('ru-RU')}
                          </span>
                        </div>

                        {/* Car Info */}
                        {car && (
                          <div className="flex gap-4 items-center">
                            {car.images?.[0] && (
                              <img 
                                src={car.images[0]} 
                                alt={`${car.make} ${car.model}`}
                                className="w-20 h-14 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-semibold">{car.make} {car.model} {car.year}</p>
                              <p className="text-primary font-bold text-sm">
                                {new Intl.NumberFormat('ru-RU', { 
                                  style: 'currency', 
                                  currency: 'KZT', 
                                  maximumFractionDigits: 0 
                                }).format(car.public_price)}
                              </p>
                            </div>
                            <Link to={`/car/${car.id}`} className="ml-auto">
                              <Button variant="ghost" size="sm" className="gap-1">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        )}

                        <Separator />

                        {/* Manager Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-muted-foreground" />
                            {lead.manager ? (
                              <div>
                                <p className="font-medium">{lead.manager.full_name || 'Менеджер'}</p>
                                {lead.manager.phone && (
                                  <a 
                                    href={`tel:${lead.manager.phone}`}
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {lead.manager.phone}
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Ожидает менеджера
                              </span>
                            )}
                          </div>

                          {/* Review Button */}
                          {lead.manager && (
                            lead.review ? (
                              <div className="flex items-center gap-1 text-sm">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= lead.review.rating
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            ) : (
                              <Link to={`/rate?token=${lead.rating_token}`}>
                                <Button size="sm" variant="outline" className="gap-1">
                                  <MessageSquare className="w-4 h-4" />
                                  Оценить
                                </Button>
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Нет заявок</h3>
                  <p className="text-muted-foreground mb-4">
                    Вы ещё не оставляли заявок на автомобили
                  </p>
                  <Link to="/catalog">
                    <Button>
                      <Car className="w-4 h-4 mr-2" />
                      Перейти в каталог
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClientDashboard;
