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

      // If managerId specified, filter by it (for backward compat)
      // Otherwise RLS will handle visibility (new + own for managers, all for admins)
      if (managerId) {
        query = query.or(`assigned_manager_id.eq.${managerId},assigned_manager_id.is.null`);
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
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string; assigned_manager_id?: string }) => {
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

// Получить заявку по токену для страницы оценки
export function useLeadByToken(token: string | null) {
  return useQuery({
    queryKey: ['lead', 'token', token],
    queryFn: async () => {
      if (!token) return null;
      
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id, 
          customer_name, 
          status,
          assigned_manager_id,
          rating_token
        `)
        .eq('rating_token', token)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });
}
