// Supabase Edge Function — real AI interviewer via Google Gemini.
//
// Deploy with: supabase functions deploy ai-interview
// Then set the secret (server-side only, never shipped to the client):
//   supabase secrets set GEMINI_API_KEY=your_real_key_here
//
// IMPORTANT: if you pasted a real key anywhere other than
// `supabase secrets set` (e.g. in chat, in a committed file, in frontend
// code), treat it as compromised and rotate it in Google AI Studio /
// Google Cloud Console before using it here.
//
// This function is the ONLY place that talks to Gemini. The frontend only
// ever calls this Edge Function with its Supabase session token — it never
// sees GEMINI_API_KEY.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type InterviewType = 'coding' | 'behavioral' | 'system_design';

interface TranscriptTurn {
  role: 'interviewer' | 'candidate';
  text: string;
  at: string;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };
}

function systemInstructionFor(type: InterviewType) {
  const base =
    'You are a professional, encouraging but rigorous technical interviewer conducting a real mock interview. ' +
    'Ask one question or follow-up at a time. Never reveal solutions or hints — if the candidate is stuck, ask a ' +
    'guiding question instead of giving away the answer. Keep responses concise (2-4 sentences), as if speaking ' +
    'out loud in a live interview. Do not break character or mention that you are an AI model.';

  switch (type) {
    case 'coding':
      return base + ' Focus on a coding/algorithms problem: correctness, time/space complexity, and edge cases.';
    case 'behavioral':
      return base + ' Focus on behavioral questions (e.g. STAR-format): teamwork, conflict resolution, ownership, and past project impact.';
    case 'system_design':
      return base + ' Focus on system design: requirements gathering, high-level architecture, data modeling, scaling trade-offs, and bottlenecks.';
  }
}

async function callGemini(systemInstruction: string, contents: { role: string; parts: { text: string }[] }[], responseSchema?: object) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Run: supabase secrets set GEMINI_API_KEY=...');
  }

  const body: Record<string, unknown> = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents,
  };
  if (responseSchema) {
    body.generationConfig = { responseMimeType: 'application/json', responseSchema };
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY, // header, not query string — keeps the key out of logs/URLs
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini request failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? '';
  if (!text) throw new Error('Gemini returned an empty response.');
  return text;
}

function transcriptToGeminiContents(transcript: TranscriptTurn[]) {
  return transcript.map((turn) => ({
    role: turn.role === 'interviewer' ? 'model' : 'user',
    parts: [{ text: turn.text }],
  }));
}

const SCORE_SCHEMA = {
  type: 'object',
  properties: {
    technical_score: { type: 'integer' },
    communication_score: { type: 'integer' },
    confidence_score: { type: 'integer' },
    problem_solving_score: { type: 'integer' },
    summary: { type: 'string' },
  },
  required: ['technical_score', 'communication_score', 'confidence_score', 'problem_solving_score', 'summary'],
};

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
    const userId = userData.user.id;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const payload = await req.json();
    const action: 'start' | 'respond' | 'end' = payload.action;

    // ---------------------------------------------------------------
    // START — create a session and ask the first question
    // ---------------------------------------------------------------
    if (action === 'start') {
      const interviewType: InterviewType = payload.interview_type ?? 'coding';
      const systemInstruction = systemInstructionFor(interviewType);

      const openingPrompt =
        'Begin the interview now. Introduce yourself briefly in one sentence, then ask the candidate your opening question.';
      const firstQuestion = await callGemini(systemInstruction, [{ role: 'user', parts: [{ text: openingPrompt }] }]);

      const transcript: TranscriptTurn[] = [{ role: 'interviewer', text: firstQuestion, at: new Date().toISOString() }];

      const { data: session, error } = await adminClient
        .from('interview_sessions')
        .insert({ user_id: userId, interview_type: interviewType, status: 'in_progress', transcript })
        .select()
        .single();
      if (error) throw error;

      return new Response(JSON.stringify({ session_id: session.id, message: firstQuestion, transcript }), { headers: corsHeaders() });
    }

    // ---------------------------------------------------------------
    // RESPOND — candidate answered; get the next question/follow-up
    // ---------------------------------------------------------------
    if (action === 'respond') {
      const { session_id, message } = payload;
      if (!session_id || typeof message !== 'string' || !message.trim()) {
        return new Response(JSON.stringify({ error: 'session_id and non-empty message are required' }), { status: 400, headers: corsHeaders() });
      }

      const { data: session, error: fetchError } = await adminClient
        .from('interview_sessions')
        .select('*')
        .eq('id', session_id)
        .eq('user_id', userId)
        .single();
      if (fetchError || !session) {
        return new Response(JSON.stringify({ error: 'Interview session not found' }), { status: 404, headers: corsHeaders() });
      }
      if (session.status !== 'in_progress') {
        return new Response(JSON.stringify({ error: 'This interview has already ended' }), { status: 409, headers: corsHeaders() });
      }

      const transcript: TranscriptTurn[] = [...(session.transcript ?? []), { role: 'candidate', text: message, at: new Date().toISOString() }];
      const systemInstruction = systemInstructionFor(session.interview_type as InterviewType);

      const reply = await callGemini(systemInstruction, transcriptToGeminiContents(transcript));
      transcript.push({ role: 'interviewer', text: reply, at: new Date().toISOString() });

      const { error: updateError } = await adminClient.from('interview_sessions').update({ transcript }).eq('id', session_id);
      if (updateError) throw updateError;

      return new Response(JSON.stringify({ message: reply, transcript }), { headers: corsHeaders() });
    }

    // ---------------------------------------------------------------
    // END — score the full transcript and close the session
    // ---------------------------------------------------------------
    if (action === 'end') {
      const { session_id } = payload;
      const { data: session, error: fetchError } = await adminClient
        .from('interview_sessions')
        .select('*')
        .eq('id', session_id)
        .eq('user_id', userId)
        .single();
      if (fetchError || !session) {
        return new Response(JSON.stringify({ error: 'Interview session not found' }), { status: 404, headers: corsHeaders() });
      }

      const transcript: TranscriptTurn[] = session.transcript ?? [];
      let scores = { technical_score: 0, communication_score: 0, confidence_score: 0, problem_solving_score: 0, summary: 'Not enough conversation to generate a meaningful score.' };

      // Only ask for real scoring if there was an actual exchange — an
      // interview with zero candidate turns has nothing real to grade.
      const candidateTurns = transcript.filter((t) => t.role === 'candidate');
      if (candidateTurns.length > 0) {
        const scoringInstruction =
          'You are grading the mock interview transcript above. Return calibrated integer scores from 0-100 for ' +
          'technical_score, communication_score, confidence_score, and problem_solving_score, plus a 2-3 sentence ' +
          'summary of concrete strengths and one concrete area to improve. Be honest — do not default to high scores.';
        const raw = await callGemini(
          systemInstructionFor(session.interview_type as InterviewType),
          [...transcriptToGeminiContents(transcript), { role: 'user', parts: [{ text: scoringInstruction }] }],
          SCORE_SCHEMA
        );
        scores = JSON.parse(raw);
      }

      const { error: updateError } = await adminClient
        .from('interview_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          technical_score: scores.technical_score,
          communication_score: scores.communication_score,
          confidence_score: scores.confidence_score,
          problem_solving_score: scores.problem_solving_score,
        })
        .eq('id', session_id);
      if (updateError) throw updateError;

      return new Response(JSON.stringify(scores), { headers: corsHeaders() });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), { status: 400, headers: corsHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown AI interview error' }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
});
