import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Submission, UserStats } from '../lib/database.types';

const emptyStats = (userId: string): UserStats => ({
  user_id: userId,
  username: '',
  full_name: '',
  avatar_url: null,
  accepted_count: 0,
  easy_solved: 0,
  medium_solved: 0,
  hard_solved: 0,
  total_submissions: 0,
  acceptance_rate: 0,
});

export function useUserStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-stats', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      // A brand-new user has no submissions yet, so the view returns no row —
      // that's a real, correct zero state, not missing data.
      return (data as UserStats) ?? emptyStats(userId as string);
    },
  });
}

export interface StreakInfo {
  currentStreakDays: number;
  longestStreakDays: number;
  activeDates: Set<string>; // 'YYYY-MM-DD' — used to render the real heatmap
}

function toDateKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

/** Computed entirely from real submission timestamps — zero for a user with no submissions. */
export function useStreak(userId: string | undefined) {
  return useQuery({
    queryKey: ['streak', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<StreakInfo> => {
      const { data, error } = await supabase
        .from('submissions')
        .select('submitted_at')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });
      if (error) throw error;

      const submissions = (data ?? []) as Pick<Submission, 'submitted_at'>[];
      const activeDates = new Set(submissions.map((s) => toDateKey(s.submitted_at)));

      if (activeDates.size === 0) {
        return { currentStreakDays: 0, longestStreakDays: 0, activeDates };
      }

      const sortedDates = Array.from(activeDates).sort().reverse();
      const oneDayMs = 24 * 60 * 60 * 1000;

      // Current streak: walk back from today (or yesterday, so a streak
      // isn't broken just because today hasn't happened yet).
      let currentStreakDays = 0;
      let cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      if (!activeDates.has(cursor.toISOString().slice(0, 10))) {
        cursor = new Date(cursor.getTime() - oneDayMs);
      }
      while (activeDates.has(cursor.toISOString().slice(0, 10))) {
        currentStreakDays++;
        cursor = new Date(cursor.getTime() - oneDayMs);
      }

      // Longest streak: scan every date once.
      let longestStreakDays = 1;
      let running = 1;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const a = new Date(sortedDates[i]).getTime();
        const b = new Date(sortedDates[i + 1]).getTime();
        if (a - b === oneDayMs) {
          running++;
          longestStreakDays = Math.max(longestStreakDays, running);
        } else {
          running = 1;
        }
      }

      return { currentStreakDays, longestStreakDays, activeDates };
    },
  });
}

const SKILL_TOPICS = ['Arrays', 'Trees', 'Dynamic Programming', 'Graph', 'Strings', 'Math'] as const;

export interface SkillGraphPoint {
  skill: string;
  value: number;
}

/** Solved-per-topic counts computed from real accepted submissions joined to problem topics — all zero if nothing is solved. */
export function useSkillGraph(userId: string | undefined) {
  return useQuery({
    queryKey: ['skill-graph', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<SkillGraphPoint[]> => {
      const { data, error } = await supabase
        .from('submissions')
        .select('problem_id, verdict, problems!inner(topics)')
        .eq('user_id', userId)
        .eq('verdict', 'Accepted');
      if (error) throw error;

      const counts = new Map<string, number>(SKILL_TOPICS.map((t) => [t, 0]));
      const solvedProblemIds = new Set<string>();

      for (const row of (data ?? []) as any[]) {
        if (solvedProblemIds.has(row.problem_id)) continue; // count each solved problem once
        solvedProblemIds.add(row.problem_id);
        const topics: string[] = row.problems?.topics ?? [];
        for (const topic of topics) {
          if (counts.has(topic)) counts.set(topic, (counts.get(topic) ?? 0) + 1);
        }
      }

      return SKILL_TOPICS.map((skill) => ({ skill, value: counts.get(skill) ?? 0 }));
    },
  });
}
