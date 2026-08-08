import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { UserSettings } from '../lib/database.types';

export function useSettings(userId: string | undefined) {
  return useQuery({
    queryKey: ['settings', userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
      if (error) throw error;
      return data as UserSettings;
    },
  });
}

export function useUpdateSettings(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<UserSettings>) => {
      const { error } = await supabase
        .from('user_settings')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', userId] }),
  });
}

export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: { full_name?: string; bio?: string; location?: string; website?: string }) => {
      const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}

/** Real account deletion request — actual account removal requires the
 * service-role key, which must never ship to the client, so this calls
 * a server-side RPC/Edge Function you deploy separately (see SETUP.md). */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
      if (error) throw error;
    },
  });
}

/** Exports everything the signed-in user actually owns — no fabricated fields. */
export function useExportData(userId: string | undefined) {
  return useMutation({
    mutationFn: async () => {
      const [profile, submissions, settings, bookmarks] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('submissions').select('*').eq('user_id', userId),
        supabase.from('user_settings').select('*').eq('user_id', userId).single(),
        supabase.from('bookmarks').select('*').eq('user_id', userId),
      ]);

      const payload = {
        exported_at: new Date().toISOString(),
        profile: profile.data,
        submissions: submissions.data,
        settings: settings.data,
        bookmarks: bookmarks.data,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'codementor-ai-export.json';
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
