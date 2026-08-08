import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Submission } from '../lib/database.types';

export function useSubmissions(userId: string | undefined, problemId?: string) {
  return useQuery({
    queryKey: ['submissions', userId, problemId ?? 'all'],
    enabled: Boolean(userId),
    queryFn: async () => {
      let query = supabase
        .from('submissions')
        .select('*')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });

      if (problemId) query = query.eq('problem_id', problemId);

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return (data ?? []) as Submission[];
    },
  });
}

export interface JudgeResult {
  verdict: Submission['verdict'];
  passed_count: number;
  total_count: number;
  runtime_ms: number;
  failed_testcase: { input: string; expected: string; actual: string } | null;
  failed_on_hidden_case: boolean;
  error?: string;
}

/**
 * Submits code for real judging. The actual compile/run/compare happens
 * server-side in the `judge` Edge Function — this never trusts anything
 * the client claims about correctness.
 */
export function useSubmitCode(problemId: string, userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ language, code }: { language: string; code: string }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('You must be signed in to submit.');

      const { data, error } = await supabase.functions.invoke<JudgeResult>('judge', {
        body: { problem_id: problemId, language, code },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;
      if (!data) throw new Error('The judge returned no result.');
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-stats', userId] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
