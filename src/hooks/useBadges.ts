import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { BadgeDefinition } from '../lib/database.types';

export function useBadgeDefinitions() {
  return useQuery({
    queryKey: ['badge-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('badges').select('*');
      if (error) throw error;
      return (data ?? []) as BadgeDefinition[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
