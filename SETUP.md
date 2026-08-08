# Setup Guide — CodeMentor AI (real backend)

This app now runs on a **real Supabase backend** (Postgres + Auth + Edge
Functions) instead of mock data. Nothing here can be provisioned for you
automatically — you need to create your own Supabase project and run these
steps yourself.

If an API key (Supabase or Gemini) was ever pasted into a chat, committed to
a file, or shown in a screenshot, treat it as compromised and rotate it
before using it here.

## 1. Create a Supabase project

1. Go to https://supabase.com/dashboard and create a new project.
2. Once it's provisioned, go to **Project Settings -> API** and copy:
   - `Project URL` -> `VITE_SUPABASE_URL`
   - `anon` `public` key -> `VITE_SUPABASE_ANON_KEY`
3. Copy `.env.example` to `.env` and paste those two values in. This file is
   already gitignored — never commit real keys.

## 2. Run the database schema

1. In the Supabase dashboard, open **SQL Editor**.
2. Paste and run the contents of `sql/01_schema.sql`.
3. Paste and run the contents of `sql/02_seed_problems.sql` (seeds 10
   real, verified problems — see the note at the top of that file for
   exactly what's covered and what isn't yet).

## 3. Enable email auth (and OAuth, optional)

Email/password auth is on by default. If you want the Google/GitHub buttons
on the login page to work, enable those providers under
**Authentication -> Providers** in the dashboard and set their redirect URLs
per Supabase's docs.

## 4. Install the Supabase CLI and link your project

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
```

## 5. Deploy the Edge Functions

There are three Edge Functions — none of them can run without being
deployed, and none of your secrets ever reach the frontend bundle:

```bash
supabase functions deploy judge
supabase functions deploy ai-interview
supabase functions deploy delete-account
```

## 6. Set server-side secrets

```bash
# Used by the `judge` function to run submitted code
supabase secrets set PISTON_URL=https://emkc.org/api/v2/piston

# Used by the `ai-interview` function — get a key from https://aistudio.google.com/apikey
supabase secrets set GEMINI_API_KEY=your_real_gemini_key
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
injected automatically by the platform for every Edge Function — you don't
set those yourself.

## 7. Run the app

```bash
npm install
npm run dev
```

Sign up for a real account, and everything — dashboard, profile, skill
graph, leaderboard, badges — will correctly start at zero until you actually
solve problems.

## What's real vs. what's still a known gap

**Real:**
- Auth (signup/login/logout, session persists across refresh)
- Problems, examples, and the actual judge (Piston-backed compile/run/compare)
- Hidden test cases are genuinely inaccessible from the browser (RLS with no
  client-facing select policy on `testcases` — only the Edge Function's
  service-role key can read them)
- Submissions, dashboard stats, streaks, heatmap, skill graph, leaderboard,
  badges (derived from real thresholds, never auto-awarded), bookmarks,
  settings, account deletion, data export
- AI interview: real Gemini-backed conversation, real Web Speech API
  dictation, real browser text-to-speech, real camera/mic/screen-share
  capture, real transcript, real (Gemini-scored) final report, real history

**Known gaps, honestly:**
- Problem library covers 10 problems / 16 topics with real content; the
  Problems page filter UI lists the full requested topic taxonomy (~40
  topics) so it's ready for more, but most topics have zero seeded problems
  right now. Add more using `sql/02_seed_problems.sql` as a template.
- Global search covers Problems only. Users/companies/contests/articles/
  courses aren't built as data models yet.
- No contests system yet (removed the fake "Upcoming Contests" card rather
  than leave it non-functional).
- Theme/language switcher was removed from Settings rather than kept as a
  non-functional control — the app is dark-mode only right now.
- Rate limiting, offline handling, and full production hardening (beyond
  RLS + auth + input validation already in place) are not implemented.
