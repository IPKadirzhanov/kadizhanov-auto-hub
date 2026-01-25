import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Car, User, Phone, Star, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { LEAD_STATUSES } from '@/lib/constants';

const LeadStatus = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { data, isLoading, error } = useQuery({
    queryKey: ['lead-status', token],
    queryFn: async () => {
      if (!token) return null;

      // Get lead with car info
      const { data: lead, error: leadError } = await supabase
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
        .eq('rating_token', token)
        .maybeSingle();

      if (leadError) throw leadError;
      if (!lead) return null;

      // Get manager info if assigned
      let manager = null;
      if (lead.assigned_manager_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('user_id', lead.assigned_manager_id)
          .maybeSingle();
        manager = profile;
      }

      // Check if already reviewed
      const { data: review } = await supabase
        .from('reviews')
        .select('id, rating, comment')
        .eq('lead_id', lead.id)
        .maybeSingle();

      return { lead, manager, review };
    },
    enabled: !!token,
  });

  if (!token) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Неверная ссылка</h1>
          <p className="text-muted-foreground">Ссылка для отслеживания заявки недействительна.</p>
        </div>
      </MainLayout>
    );
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-20 flex justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error || !data?.lead) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Заявка не найдена</h1>
          <p className="text-muted-foreground">Возможно, ссылка устарела или неверна.</p>
        </div>
      </MainLayout>
    );
  }

  const { lead, manager, review } = data;
  const status = LEAD_STATUSES[lead.status as keyof typeof LEAD_STATUSES];
  const car = lead.cars;

  return (
    <MainLayout>
      <div className="container py-12 max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Статус вашей заявки</CardTitle>
            <p className="text-muted-foreground">
              Заявка от {new Date(lead.created_at).toLocaleDateString('ru-RU')}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge className={`${status?.color} text-white text-lg px-4 py-2`}>
                {status?.label || lead.status}
              </Badge>
            </div>

            <Separator />

            {/* Car Info */}
            {car && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" /> Автомобиль
                </h3>
                <div className="flex gap-4 items-center bg-secondary/50 p-4 rounded-lg">
                  {car.images?.[0] && (
                    <img 
                      src={car.images[0]} 
                      alt={`${car.make} ${car.model}`}
                      className="w-24 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{car.make} {car.model} {car.year}</p>
                    <p className="text-primary font-bold">
                      {new Intl.NumberFormat('ru-RU', { 
                        style: 'currency', 
                        currency: 'KZT', 
                        maximumFractionDigits: 0 
                      }).format(car.public_price)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Manager Info */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Ваш менеджер
              </h3>
              {manager ? (
                <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                  <p className="font-semibold text-lg">{manager.full_name || 'Менеджер'}</p>
                  {manager.phone && (
                    <a 
                      href={`tel:${manager.phone}`} 
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Phone className="w-4 h-4" /> {manager.phone}
                    </a>
                  )}
                </div>
              ) : (
                <div className="bg-secondary/50 p-4 rounded-lg flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Менеджер скоро свяжется с вами
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Review Section */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" /> Отзыв
              </h3>
              
              {review ? (
                <div className="bg-green-500/10 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Вы оставили отзыв</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ) : manager ? (
                <Link to={`/rate?token=${token}`}>
                  <Button className="w-full gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Оставить отзыв о менеджере
                  </Button>
                </Link>
              ) : (
                <p className="text-muted-foreground text-sm">
                  После того как менеджер возьмёт вашу заявку, вы сможете оставить отзыв.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default LeadStatus;
