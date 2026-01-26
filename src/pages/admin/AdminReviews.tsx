import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, CheckCircle, XCircle, MessageSquare, 
  User, Calendar, Loader2 
} from 'lucide-react';
import { toast } from 'sonner';

const AdminReviews = () => {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          customer_name,
          is_approved,
          created_at,
          lead_id,
          manager_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch manager names
      const reviewsWithManagers = await Promise.all(
        (data || []).map(async (review) => {
          let managerName = null;
          if (review.manager_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', review.manager_id)
              .maybeSingle();
            managerName = profile?.full_name;
          }
          return { ...review, managerName };
        })
      );

      return reviewsWithManagers;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: approve })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success(approve ? 'Отзыв одобрен' : 'Отзыв отклонён');
    },
    onError: () => {
      toast.error('Ошибка при обновлении отзыва');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Отзыв удалён');
    },
    onError: () => {
      toast.error('Ошибка при удалении отзыва');
    },
  });

  const pendingReviews = reviews?.filter(r => !r.is_approved) || [];
  const approvedReviews = reviews?.filter(r => r.is_approved) || [];

  return (
    <DashboardLayout title="Отзывы клиентов">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reviews?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Всего отзывов</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingReviews.length}</p>
                  <p className="text-sm text-muted-foreground">Ожидают модерации</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedReviews.length}</p>
                  <p className="text-sm text-muted-foreground">Опубликовано</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                Ожидают модерации ({pendingReviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingReviews.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review}
                    onApprove={() => approveMutation.mutate({ id: review.id, approve: true })}
                    onReject={() => approveMutation.mutate({ id: review.id, approve: false })}
                    onDelete={() => deleteMutation.mutate(review.id)}
                    isPending
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approved Reviews */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Опубликованные отзывы ({approvedReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : approvedReviews.length > 0 ? (
              <div className="space-y-4">
                {approvedReviews.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review}
                    onDelete={() => deleteMutation.mutate(review.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Нет опубликованных отзывов</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    customer_name: string | null;
    is_approved: boolean;
    created_at: string;
    managerName: string | null;
  };
  onApprove?: () => void;
  onReject?: () => void;
  onDelete: () => void;
  isPending?: boolean;
}

const ReviewCard = ({ review, onApprove, onReject, onDelete, isPending }: ReviewCardProps) => {
  return (
    <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{review.customer_name || 'Клиент'}</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isPending ? 'secondary' : 'default'}>
            {isPending ? 'На модерации' : 'Опубликован'}
          </Badge>
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-muted-foreground">{review.comment}</p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(review.created_at).toLocaleDateString('ru-RU')}
          </span>
          {review.managerName && (
            <span>Менеджер: {review.managerName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPending && onApprove && (
            <Button size="sm" variant="default" onClick={onApprove} className="gap-1">
              <CheckCircle className="w-4 h-4" />
              Одобрить
            </Button>
          )}
          {isPending && onReject && (
            <Button size="sm" variant="outline" onClick={onReject} className="gap-1">
              <XCircle className="w-4 h-4" />
              Отклонить
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive">
            Удалить
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
