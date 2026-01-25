import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Lead, LeadStatus } from '@/types/database';

export function useLeads(managerId?: string) {
  return useQuery({
    queryKey: ['leads', managerId],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*, cars(make, model, year, public_price)')
        .order('created_at', { ascending: false });

      if (managerId) {
        query = query.eq('assigned_manager_id', managerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lead: {
      customer_name: string;
      customer_phone: string;
      customer_email?: string;
      car_id?: string;
      message?: string;
      source?: string;
    }) => {
      const { data, error } = await supabase
        .from('leads')
        .insert(lead)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: ['leads', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('status, created_at');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        new: data.filter(l => l.status === 'new').length,
        inProgress: data.filter(l => ['contacted', 'negotiating'].includes(l.status)).length,
        closed: data.filter(l => ['closed_won', 'closed_lost'].includes(l.status)).length,
        won: data.filter(l => l.status === 'closed_won').length,
      };
      
      return stats;
    },
  });
}
