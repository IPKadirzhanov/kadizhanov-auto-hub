import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLeads } from '@/hooks/useLeads';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LEAD_STATUSES } from '@/lib/constants';
import { Phone, Mail, Car, Calendar, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminLeads = () => {
  const { data: leads, isLoading } = useLeads();
  const [filter, setFilter] = useState<string>('all');

  // Fetch manager profiles for display
  const { data: managers } = useQuery({
    queryKey: ['manager-profiles'],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'manager');
      
      if (!roles?.length) return {};
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', roles.map(r => r.user_id));
      
      return profiles?.reduce((acc, p) => {
        acc[p.user_id] = p.full_name || 'Без имени';
        return acc;
      }, {} as Record<string, string>) || {};
    }
  });

  const filteredLeads = leads?.filter(l => filter === 'all' || l.status === filter) || [];

  const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <DashboardLayout title="Заявки">
      <div className="space-y-6">
        <div className="flex gap-4 items-center">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              {Object.entries(LEAD_STATUSES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">Найдено: {filteredLeads.length}</span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-secondary animate-pulse rounded-xl" />)}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Заявок нет</div>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead: any) => (
              <Card key={lead.id} className="glass-card">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg">{lead.customer_name}</h3>
                        <Badge className={`${LEAD_STATUSES[lead.status as keyof typeof LEAD_STATUSES]?.color} text-white`}>
                          {LEAD_STATUSES[lead.status as keyof typeof LEAD_STATUSES]?.label}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <a href={`tel:${lead.customer_phone}`} className="flex items-center gap-1 hover:text-primary">
                          <Phone className="w-4 h-4" /> {lead.customer_phone}
                        </a>
                        {lead.customer_email && (
                          <a href={`mailto:${lead.customer_email}`} className="flex items-center gap-1 hover:text-primary">
                            <Mail className="w-4 h-4" /> {lead.customer_email}
                          </a>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {formatDate(lead.created_at)}
                        </span>
                      </div>
                      
                      {lead.cars && (
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="w-4 h-4 text-primary" />
                          <span>{lead.cars.make} {lead.cars.model} {lead.cars.year}</span>
                          <span className="text-muted-foreground">
                            ({new Intl.NumberFormat('ru-RU').format(lead.cars.public_price)} ₸)
                          </span>
                        </div>
                      )}
                      
                      {lead.message && (
                        <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                          {lead.message}
                        </p>
                      )}
                    </div>
                    
                    {/* Manager info - admin only views, doesn't edit */}
                    <div className="flex flex-col items-end gap-2 min-w-[160px]">
                      {lead.assigned_manager_id ? (
                        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-lg">
                          <User className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">
                            {managers?.[lead.assigned_manager_id] || 'Менеджер'}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Не назначен
                        </Badge>
                      )}
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

export default AdminLeads;
