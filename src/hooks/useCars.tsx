import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Car, CarStatus } from '@/types/database';

interface CarFilters {
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  bodyType?: string;
  fuelType?: string;
  status?: CarStatus;
  search?: string;
}

export function useCars(filters?: CarFilters) {
  return useQuery({
    queryKey: ['cars', filters],
    queryFn: async () => {
      let query = supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.make) {
        query = query.eq('make', filters.make);
      }
      if (filters?.minPrice) {
        query = query.gte('public_price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('public_price', filters.maxPrice);
      }
      if (filters?.minYear) {
        query = query.gte('year', filters.minYear);
      }
      if (filters?.maxYear) {
        query = query.lte('year', filters.maxYear);
      }
      if (filters?.bodyType) {
        query = query.eq('body_type', filters.bodyType);
      }
      if (filters?.fuelType) {
        query = query.eq('fuel_type', filters.fuelType);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`make.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Car[];
    },
  });
}

export function useCar(id: string) {
  return useQuery({
    queryKey: ['car', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Car | null;
    },
    enabled: !!id,
  });
}

export function useFeaturedCars() {
  return useQuery({
    queryKey: ['cars', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('is_featured', true)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data as Car[];
    },
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (car: Omit<Car, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('cars')
        .insert(car)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Car> & { id: string }) => {
      const { data, error } = await supabase
        .from('cars')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['car', variables.id] });
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });
}
