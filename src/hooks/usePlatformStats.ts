import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { PlatformStats } from '../lib/database.types';

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('platform_stats').select('*').single();
      if (error) throw error;
      return data as PlatformStats;
    },
    staleTime: 5 * 60 * 1000,
  });
}
