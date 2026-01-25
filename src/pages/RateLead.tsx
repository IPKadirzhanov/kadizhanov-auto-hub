import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, CheckCircle, Car } from 'lucide-react';
import { toast } from 'sonner';
import { MainLayout } from '@/components/layout/MainLayout';

const RateLead = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Fetch lead by token
  const { data: leadData, isLoading: leadLoading, error: leadError } = useQuery({
    queryKey: ['rate-lead', token],
    queryFn: async () => {
      if (!token) return null;
      
      // Get lead info
      const { data: lead, error } = await supabase
        .from('leads')
        .select('id, customer_name, assigned_manager_id, status, rating_token')
        .eq('rating_token', token)
        .maybeSingle();
      
      if (error) throw error;
      if (!lead) return null;
      
      // Get manager profile if assigned
      let managerName = null;
      if (lead.assigned_manager_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', lead.assigned_manager_id)
          .maybeSingle();
        
        managerName = profile?.full_name;
      }
      
      // Check if already reviewed
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('lead_id', lead.id)
        .maybeSingle();
      
      return {
        ...lead,
        managerName,
        alreadyReviewed: !!existingReview
      };
    },
    enabled: !!token,
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!leadData) throw new Error('Заявка не найдена');
      
      const { error } = await supabase
        .from('reviews')
        .insert({
          lead_id: leadData.id,
          manager_id: leadData.assigned_manager_id,
          rating,
          comment: comment || null,
          customer_name: leadData.customer_name,
          is_approved: false // Требует одобрения админа
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Спасибо за отзыв!');
    },
    onError: (e) => toast.error('Ошибка: ' + (e as Error).message)
  });

  if (!token) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Неверная ссылка</h1>
          <p className="text-muted-foreground">Ссылка для оценки недействительна.</p>
        </div>
      </MainLayout>
    );
  }

  if (leadLoading) {
    return (
      <MainLayout>
        <div className="container py-20 flex justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (leadError || !leadData) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Заявка не найдена</h1>
          <p className="text-muted-foreground">Возможно, ссылка устарела или неверна.</p>
        </div>
      </MainLayout>
    );
  }

  if (!leadData.assigned_manager_id) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <Card className="max-w-md mx-auto glass-card">
            <CardContent className="p-8">
              <Car className="w-16 h-16 mx-auto text-primary mb-4" />
              <h1 className="text-xl font-bold mb-2">Ваша заявка обрабатывается</h1>
              <p className="text-muted-foreground">
                Менеджер скоро свяжется с вами. После этого вы сможете оценить качество обслуживания.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (leadData.alreadyReviewed || submitted) {
    return (
      <MainLayout>
        <div className="container py-20 text-center">
          <Card className="max-w-md mx-auto glass-card">
            <CardContent className="p-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h1 className="text-xl font-bold mb-2">Спасибо за отзыв!</h1>
              <p className="text-muted-foreground">
                Ваша оценка поможет нам улучшить качество обслуживания.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-12">
        <Card className="max-w-lg mx-auto glass-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Оцените обслуживание</CardTitle>
            {leadData.managerName && (
              <p className="text-muted-foreground mt-2">
                Вас обслуживал: <span className="font-semibold text-foreground">{leadData.managerName}</span>
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Star rating */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              {rating === 0 && 'Выберите оценку от 1 до 5'}
              {rating === 1 && 'Очень плохо'}
              {rating === 2 && 'Плохо'}
              {rating === 3 && 'Нормально'}
              {rating === 4 && 'Хорошо'}
              {rating === 5 && 'Отлично!'}
            </div>

            {/* Comment */}
            <div>
              <Textarea
                placeholder="Расскажите подробнее о вашем опыте (необязательно)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            </div>

            <Button 
              onClick={() => submitReview.mutate()}
              disabled={rating === 0 || submitReview.isPending}
              className="w-full"
              size="lg"
            >
              {submitReview.isPending ? 'Отправка...' : 'Отправить оценку'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RateLead;
