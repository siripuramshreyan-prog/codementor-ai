# CodeMentor AI

A coding practice / interview-prep platform: real auth, a real problem
library with a real judge, real dashboard/profile/leaderboard/badge stats
computed from actual submissions, and a real Gemini-backed AI interviewer.

**Start here: [SETUP.md](./SETUP.md)** — the app will not run until you
create a Supabase project and follow those steps; there's no working
backend bundled with this repo (a real one has to be provisioned with your
own credentials).

## Tech Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · React Router ·
Framer Motion · GSAP (ScrollTrigger) · TanStack Query · React Hook Form + Zod
· Monaco Editor · Supabase (Postgres, Auth, Edge Functions) · Piston (code
execution) · Google Gemini (AI interviewer)

## Project Structure

```
sql/                        Postgres schema + seed data (run in Supabase SQL Editor)
supabase/functions/
  judge/                    Real judge: compiles/runs/compares via Piston,
                             keeps hidden test cases server-side only
  ai-interview/              Real AI interviewer via Gemini
  delete-account/            Real account deletion (needs service-role key)
src/
  contexts/AuthContext.tsx   Real Supabase auth, session persists on refresh
  components/auth/           Route guards
  hooks/                     All data access — no mock arrays, every hook
                             queries Supabase directly
  lib/supabase.ts            Supabase client
  lib/badges.ts              Pure badge-unlock derivation from real stats
  pages/                     Landing, Login, Register, Dashboard, Problems,
                             ProblemDetail, InterviewPage, Leaderboard,
                             Profile, Settings
```

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + anon key
npm run dev
npm run build           # type-check + production build
```

See [SETUP.md](./SETUP.md) for the full backend provisioning steps
(schema, Edge Function deploys, secrets) and an honest list of what's fully
real versus what's a known, documented gap in this pass (global search
scope, problem library size, no contests system yet, etc.).

## Security notes

- Row Level Security is enabled on every table. `testcases` has zero
  client-facing policies — hidden test cases are only ever readable by the
  `judge` Edge Function via the service-role key, never by the browser.
- `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are Edge Function secrets
  only — they are never bundled into frontend code and never sent to the
  browser.
- If a real key was ever pasted into chat, a commit, or a screenshot,
  rotate it before using this project.
