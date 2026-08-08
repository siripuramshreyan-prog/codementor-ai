import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type InterviewType = 'coding' | 'behavioral' | 'system_design';

export interface TranscriptTurn {
  role: 'interviewer' | 'candidate';
  text: string;
  at: string;
}

interface ScoreResult {
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  problem_solving_score: number;
  summary: string;
}

async function invokeAiInterview<T>(body: Record<string, unknown>): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error('You must be signed in.');

  const { data, error } = await supabase.functions.invoke<T & { error?: string }>('ai-interview', {
    body,
    headers: { Authorization: `Bearer ${token}` },
  });
  if (error) throw error;
  if (!data) throw new Error('No response from the interview service.');
  if ((data as any).error) throw new Error((data as any).error);
  return data;
}

export function useStartInterview() {
  return useMutation({
    mutationFn: (interviewType: InterviewType) =>
      invokeAiInterview<{ session_id: string; message: string; transcript: TranscriptTurn[] }>({
        action: 'start',
        interview_type: interviewType,
      }),
  });
}

export function useRespondToInterview() {
  return useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: string }) =>
      invokeAiInterview<{ message: string; transcript: TranscriptTurn[] }>({
        action: 'respond',
        session_id: sessionId,
        message,
      }),
  });
}

export function useEndInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => invokeAiInterview<ScoreResult>({ action: 'end', session_id: sessionId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['interview-history'] }),
  });
}

export function useInterviewHistory(userId: string | undefined) {
  return useQuery({
    queryKey: ['interview-history', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}
