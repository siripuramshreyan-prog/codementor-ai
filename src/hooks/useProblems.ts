import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Difficulty, Problem, ProblemExample } from '../lib/database.types';

export interface ProblemFilters {
  search?: string;
  difficulty?: Difficulty | 'All';
  topic?: string | 'All';
  company?: string | 'All';
}

export function useProblems(filters: ProblemFilters) {
  return useQuery({
    queryKey: ['problems', filters],
    queryFn: async () => {
      let query = supabase.from('problems').select('*').order('order_index', { ascending: true });

      if (filters.difficulty && filters.difficulty !== 'All') {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters.topic && filters.topic !== 'All') {
        query = query.contains('topics', [filters.topic]);
      }
      if (filters.company && filters.company !== 'All') {
        query = query.contains('companies', [filters.company]);
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Problem[];
    },
  });
}

export function useProblem(slug: string | undefined) {
  return useQuery({
    queryKey: ['problem', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data: problem, error } = await supabase.from('problems').select('*').eq('slug', slug).single();
      if (error) throw error;

      const { data: examples, error: exError } = await supabase
        .from('problem_examples')
        .select('*')
        .eq('problem_id', (problem as Problem).id)
        .order('order_index', { ascending: true });
      if (exError) throw exError;

      return { problem: problem as Problem, examples: (examples ?? []) as ProblemExample[] };
    },
  });
}
