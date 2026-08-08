import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { LeaderboardRow } from '../lib/database.types';

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leaderboard').select('*').order('rank', { ascending: true }).limit(100);
      if (error) throw error;
      return (data ?? []) as LeaderboardRow[];
    },
  });
}
