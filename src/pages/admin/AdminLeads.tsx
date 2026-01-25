import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLeads, useUpdateLead } from '@/hooks/useLeads';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LEAD_STATUSES } from '@/lib/constants';
import { Phone, Mail, Car, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { LeadStatus } from '@/types/database';

const AdminLeads = () => {
  const { data: leads, isLoading } = useLeads();
  const updateLead = useUpdateLead();
  const [filter, setFilter] = useState<string>('all');

  const filteredLeads = leads?.filter(l => filter === 'all' || l.status === filter) || [];

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      await updateLead.mutateAsync({ id, status });
      toast.success('Статус обновлён');
    } catch {
      toast.error('Ошибка обновления');
    }
  };

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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-2">
                      <Select 
                        value={lead.status} 
                        onValueChange={(v) => handleStatusChange(lead.id, v as LeadStatus)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(LEAD_STATUSES).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
