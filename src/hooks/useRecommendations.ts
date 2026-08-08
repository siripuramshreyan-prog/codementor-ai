import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Problem } from '../lib/database.types';

interface WeakTopic {
  topic: string;
  wrongRate: number;
  attempts: number;
}

export function useRecommendations(userId: string | undefined) {
  return useQuery({
    queryKey: ['recommendations', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<{ problems: Problem[]; reason: string }> => {
      const { data: subs, error: subError } = await supabase
        .from('submissions')
        .select('verdict, problem_id, problems!inner(topics)')
        .eq('user_id', userId);
      if (subError) throw subError;

      const { data: solvedRows } = await supabase
        .from('submissions')
        .select('problem_id')
        .eq('user_id', userId)
        .eq('verdict', 'Accepted');
      const solvedIds = new Set((solvedRows ?? []).map((r: any) => r.problem_id));

      const topicStats = new Map<string, { wrong: number; total: number }>();
      for (const row of (subs ?? []) as any[]) {
        const topics: string[] = row.problems?.topics ?? [];
        for (const topic of topics) {
          const entry = topicStats.get(topic) ?? { wrong: 0, total: 0 };
          entry.total += 1;
          if (row.verdict !== 'Accepted') entry.wrong += 1;
          topicStats.set(topic, entry);
        }
      }

      const weakTopics: WeakTopic[] = Array.from(topicStats.entries())
        .map(([topic, s]) => ({ topic, wrongRate: s.wrong / s.total, attempts: s.total }))
        .filter((t) => t.attempts >= 1)
        .sort((a, b) => b.wrongRate - a.wrongRate);

      if (weakTopics.length === 0) {
        // No submission history yet — recommend a real on-ramp instead of guessing at "weaknesses".
        const { data, error } = await supabase.from('problems').select('*').eq('difficulty', 'Easy').order('order_index').limit(3);
        if (error) throw error;
        return { problems: (data ?? []) as Problem[], reason: 'Start with these to build a baseline — solve a few to unlock personalized recommendations.' };
      }

      const weakest = weakTopics[0];
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .contains('topics', [weakest.topic])
        .order('order_index')
        .limit(6);
      if (error) throw error;

      const unsolved = ((data ?? []) as Problem[]).filter((p) => !solvedIds.has(p.id)).slice(0, 3);
      return {
        problems: unsolved,
        reason: `Based on your submissions, "${weakest.topic}" has your highest wrong-attempt rate (${Math.round(weakest.wrongRate * 100)}%).`,
      };
    },
  });
}
