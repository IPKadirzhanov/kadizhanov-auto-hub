import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useLeads, useUpdateLead } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LEAD_STATUSES } from '@/lib/constants';
import { Phone, Mail, Car, Calendar, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import type { LeadStatus } from '@/types/database';

const ManagerLeads = () => {
  const { user } = useAuth();
  const { data: leads, isLoading } = useLeads();
  const updateLead = useUpdateLead();

  // Separate leads into "new" (unassigned) and "my" (assigned to current manager)
  const newLeads = leads?.filter(l => !l.assigned_manager_id) || [];
  const myLeads = leads?.filter(l => l.assigned_manager_id === user?.id) || [];

  const handleClaimLead = async (id: string) => {
    if (!user) return;
    try {
      await updateLead.mutateAsync({ 
        id, 
        assigned_manager_id: user.id,
        status: 'contacted' 
      });
      toast.success('Заявка взята!');
    } catch {
      toast.error('Ошибка при взятии заявки');
    }
  };

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      await updateLead.mutateAsync({ id, status });
      toast.success('Статус обновлён');
    } catch {
      toast.error('Ошибка обновления');
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  const LeadCard = ({ lead, showClaimButton = false }: { lead: any, showClaimButton?: boolean }) => (
    <Card className="glass-card">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
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
              </div>
            )}
            {lead.message && (
              <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">{lead.message}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {showClaimButton ? (
              <Button 
                onClick={() => handleClaimLead(lead.id)}
                disabled={updateLead.isPending}
                className="gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Взять заявку
              </Button>
            ) : (
              <Select 
                value={lead.status} 
                onValueChange={(v) => handleStatusChange(lead.id, v as LeadStatus)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_STATUSES)
                    .filter(([k]) => k !== 'new') // Менеджер не может вернуть статус "новая"
                    .map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Мои заявки">
      <Tabs defaultValue="new" className="space-y-6">
        <TabsList>
          <TabsTrigger value="new" className="gap-2">
            Новые
            {newLeads.length > 0 && (
              <Badge variant="secondary" className="ml-1">{newLeads.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="my" className="gap-2">
            Мои заявки
            {myLeads.length > 0 && (
              <Badge variant="secondary" className="ml-1">{myLeads.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-secondary animate-pulse rounded-xl" />)}
            </div>
          ) : newLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Нет новых заявок
            </div>
          ) : (
            newLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} showClaimButton />
            ))
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-secondary animate-pulse rounded-xl" />)}
            </div>
          ) : myLeads.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              У вас пока нет взятых заявок. Возьмите заявку из вкладки «Новые».
            </div>
          ) : (
            myLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default ManagerLeads;
