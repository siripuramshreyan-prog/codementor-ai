import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export function useBookmarks(userId: string | undefined) {
  return useQuery({
    queryKey: ['bookmarks', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('problem_id, problems(id, slug, title, difficulty)')
        .eq('user_id', userId);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useToggleBookmark(userId: string | undefined, problemId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (isBookmarked: boolean) => {
      if (isBookmarked) {
        const { error } = await supabase.from('bookmarks').delete().eq('user_id', userId).eq('problem_id', problemId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('bookmarks').insert({ user_id: userId, problem_id: problemId });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks', userId] }),
  });
}
