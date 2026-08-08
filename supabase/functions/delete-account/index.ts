// Supabase Edge Function — permanently deletes the calling user's account
// and all owned rows (via the `on delete cascade` foreign keys in
// sql/01_schema.sql). Deploy with: supabase functions deploy delete-account

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders() });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders() });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: userError } = await authClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), { status: 401, headers: corsHeaders() });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await adminClient.auth.admin.deleteUser(userData.user.id);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error deleting account' }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
});
