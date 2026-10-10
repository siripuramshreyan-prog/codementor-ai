// Supabase Edge Function — the real judge.
//
// Deploy with: supabase functions deploy judge
// Requires these secrets to already be set on the project:
//   supabase secrets set PISTON_URL=https://emkc.org/api/v2/piston
// (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY are
// injected automatically by the Supabase platform — no need to set them.)
//
// This function is the ONLY thing that can read `public.testcases`
// (that table has RLS enabled with zero client-facing policies). That is
// what makes "hidden test cases" actually hidden, not just hidden by
// convention in the UI.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PISTON_URL = Deno.env.get('PISTON_URL') ?? 'https://emkc.org/api/v2/piston';
const RUN_TIMEOUT_MS = 5000;
const MAX_REQUEST_BYTES = 100_000;
const MAX_CODE_CHARACTERS = 50_000;
const MAX_TESTCASES_PER_SUBMISSION = 100;

const LANGUAGE_ALIASES: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  'c++': 'cpp',
  cpp: 'cpp',
  go: 'go',
};

type Verdict =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Compilation Error'
  | 'Runtime Error'
  | 'Presentation Error';

interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  is_sample: boolean;
  order_index: number;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };
}

let runtimeCache: { alias: string; version: string }[] | null = null;

async function resolveVersion(alias: string): Promise<string> {
  if (!runtimeCache) {
    const res = await fetch(`${PISTON_URL}/runtimes`);
    runtimeCache = await res.json();
  }
  const match = runtimeCache!.find((r) => r.alias === alias || (r as any).language === alias);
  if (!match) throw new Error(`No Piston runtime available for "${alias}"`);
  return match.version;
}

async function runOne(language: string, code: string, stdin: string) {
  const alias = LANGUAGE_ALIASES[language.toLowerCase()] ?? language.toLowerCase();
  const version = await resolveVersion(alias);

  const res = await fetch(`${PISTON_URL}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: alias,
      version,
      files: [{ content: code }],
      stdin,
      run_timeout: RUN_TIMEOUT_MS,
      compile_timeout: RUN_TIMEOUT_MS,
    }),
  });

  if (!res.ok) throw new Error(`Piston request failed: ${res.status}`);
  return res.json();
}

function normalize(s: string) {
  return s.replace(/\r\n/g, '\n').trim();
}

function looksLikePresentationOnly(actual: string, expected: string) {
  const collapse = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  return collapse(actual) === collapse(expected) && normalize(actual) !== normalize(expected);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders() });

  try {
    const contentLength = Number(req.headers.get('content-length') ?? 0);
    if (contentLength > MAX_REQUEST_BYTES) {
      return new Response(JSON.stringify({ error: 'Request is too large. Keep submissions under 100 KB.' }), { status: 413, headers: corsHeaders() });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders() });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify the caller's identity with the anon client (respects RLS/JWT).
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await authClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), { status: 401, headers: corsHeaders() });
    }
    const userId = userData.user.id;

    const { problem_id, language, code } = await req.json();
    if (typeof problem_id !== 'string' || !problem_id.trim() || typeof language !== 'string' || typeof code !== 'string' || !code.trim()) {
      return new Response(JSON.stringify({ error: 'problem_id, language, and non-empty code are required' }), { status: 400, headers: corsHeaders() });
    }

    if (code.length > MAX_CODE_CHARACTERS) {
      return new Response(JSON.stringify({ error: 'Code is too long. The limit is 50,000 characters.' }), { status: 413, headers: corsHeaders() });
    }

    const normalizedLanguage = language.toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(LANGUAGE_ALIASES, normalizedLanguage)) {
      return new Response(JSON.stringify({ error: 'Unsupported language. Use JavaScript, TypeScript, Python, Java, C++, or Go.' }), { status: 400, headers: corsHeaders() });
    }

    // Service-role client bypasses RLS — this is the only place testcases are read.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: testcases, error: tcError } = await adminClient
      .from('testcases')
      .select('id, input, expected_output, is_hidden, is_sample, order_index')
      .eq('problem_id', problem_id)
      .order('order_index', { ascending: true });

    if (tcError) throw tcError;
    if (!testcases || testcases.length === 0) {
      return new Response(JSON.stringify({ error: 'This problem has no test cases configured yet.' }), { status: 422, headers: corsHeaders() });
    }

    if (testcases.length > MAX_TESTCASES_PER_SUBMISSION) {
      return new Response(JSON.stringify({ error: 'This problem has too many test cases configured.' }), { status: 422, headers: corsHeaders() });
    }

    let verdict: Verdict = 'Accepted';
    let passedCount = 0;
    let failedTestcase: { input: string; expected: string; actual: string } | null = null;
    let firstFailedWasHidden = false;
    const startedAt = Date.now();

    for (const tc of testcases as TestCase[]) {
      let result: any;
      try {
        result = await runOne(language, code, tc.input);
      } catch {
        verdict = 'Runtime Error';
        break;
      }

      if (result.compile && result.compile.code !== 0) {
        verdict = 'Compilation Error';
        break;
      }

      const run = result.run;
      if (run.signal === 'SIGKILL' || run.signal === 'SIGTERM') {
        verdict = 'Time Limit Exceeded';
        break;
      }
      if (run.code !== 0) {
        verdict = 'Runtime Error';
        break;
      }

      const actual = normalize(run.stdout ?? '');
      const expected = normalize(tc.expected_output);

      if (actual === expected) {
        passedCount++;
        continue;
      }

      verdict = looksLikePresentationOnly(run.stdout ?? '', tc.expected_output) ? 'Presentation Error' : 'Wrong Answer';
      firstFailedWasHidden = tc.is_hidden;
      if (!tc.is_hidden) {
        failedTestcase = { input: tc.input, expected: tc.expected_output, actual: run.stdout ?? '' };
      }
      break;
    }

    if (verdict === 'Accepted') passedCount = testcases.length;
    const runtimeMs = Date.now() - startedAt;

    const { error: insertError } = await adminClient.from('submissions').insert({
      user_id: userId,
      problem_id,
      language,
      code,
      verdict,
      runtime_ms: runtimeMs,
      passed_count: passedCount,
      total_count: testcases.length,
      failed_testcase: failedTestcase,
    });
    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({
        verdict,
        passed_count: passedCount,
        total_count: testcases.length,
        runtime_ms: runtimeMs,
        failed_testcase: failedTestcase,
        failed_on_hidden_case: verdict !== 'Accepted' && firstFailedWasHidden,
      }),
      { headers: corsHeaders() }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown judge error' }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
});
