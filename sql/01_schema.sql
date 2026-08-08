-- CodeMentor AI — core schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE throughout.

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type difficulty as enum ('Easy', 'Medium', 'Hard');
exception when duplicate_object then null; end $$;

do $$ begin
  create type verdict as enum (
    'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded',
    'Compilation Error', 'Runtime Error', 'Presentation Error'
  );
exception when duplicate_object then null; end $$;

-- ============================================================
-- PROFILES  (one row per auth.users row, created on signup)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text not null default '',
  bio text not null default '',
  location text not null default '',
  website text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 6)),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- PROBLEMS
-- ============================================================
create table if not exists public.problems (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  difficulty difficulty not null,
  description text not null,
  constraints text not null default '',
  topics text[] not null default '{}',
  companies text[] not null default '{}',
  starter_code jsonb not null default '{}', -- { "javascript": "...", "python": "...", ... }
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.problems enable row level security;

create policy "Problems are publicly readable" on public.problems
  for select using (true);

create index if not exists problems_topics_idx on public.problems using gin (topics);
create index if not exists problems_companies_idx on public.problems using gin (companies);
create index if not exists problems_difficulty_idx on public.problems (difficulty);

-- Example blocks shown on the problem page (purely descriptive, always public).
create table if not exists public.problem_examples (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  order_index int not null default 0,
  input text not null,
  output text not null,
  explanation text
);

alter table public.problem_examples enable row level security;
create policy "Examples are publicly readable" on public.problem_examples
  for select using (true);

-- ============================================================
-- TESTCASES — the actual judge suite. Intentionally has NO select
-- policy for anon/authenticated roles, so it is never fetchable from
-- the browser. Only the `judge` Edge Function (using the service-role
-- key) can read this table. This is what keeps hidden test cases hidden.
-- ============================================================
create table if not exists public.testcases (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  input text not null,
  expected_output text not null,
  is_hidden boolean not null default true,
  is_sample boolean not null default false,
  order_index int not null default 0
);

alter table public.testcases enable row level security;
-- No policies created on purpose: RLS enabled + zero policies = deny-all for
-- anon/authenticated. The service role used by the Edge Function bypasses RLS.

-- ============================================================
-- SUBMISSIONS
-- ============================================================
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  language text not null,
  code text not null,
  verdict verdict not null,
  runtime_ms int,
  memory_kb int,
  passed_count int not null default 0,
  total_count int not null default 0,
  failed_testcase jsonb, -- { input, expected, actual } for the first FAILED VISIBLE case only
  submitted_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

create policy "Users can read their own submissions" on public.submissions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own submissions" on public.submissions
  for insert with check (auth.uid() = user_id);

create index if not exists submissions_user_idx on public.submissions (user_id, submitted_at desc);
create index if not exists submissions_problem_idx on public.submissions (problem_id);

-- ============================================================
-- SETTINGS
-- ============================================================
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'dark',
  language text not null default 'en',
  email_daily_reminders boolean not null default true,
  email_contest_announcements boolean not null default true,
  email_ai_feedback boolean not null default true,
  email_weekly_summary boolean not null default false,
  email_product_updates boolean not null default false,
  two_factor_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "Users can read their own settings" on public.user_settings
  for select using (auth.uid() = user_id);

create policy "Users can update their own settings" on public.user_settings
  for update using (auth.uid() = user_id);

create policy "Users can insert their own settings" on public.user_settings
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- BOOKMARKS & NOTES
-- ============================================================
create table if not exists public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, problem_id)
);

alter table public.bookmarks enable row level security;
create policy "Users manage their own bookmarks" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  content text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, problem_id)
);

alter table public.notes enable row level security;
create policy "Users manage their own notes" on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- BADGES — definitions only. Whether a badge is "unlocked" is a pure
-- function of a user's real stats, computed at read time (see
-- src/lib/badges.ts). Nothing here is ever awarded automatically;
-- there is no user_badges table to fake-populate.
-- ============================================================
create table if not exists public.badges (
  code text primary key,
  name text not null,
  description text not null,
  requirement_type text not null, -- 'accepted_count' | 'streak_days' | 'hard_solved' | 'contest_wins' | 'topic_mastery'
  requirement_value int not null,
  requirement_meta text -- e.g. topic name for topic_mastery badges
);

alter table public.badges enable row level security;
create policy "Badge definitions are publicly readable" on public.badges
  for select using (true);

-- ============================================================
-- INTERVIEW SESSIONS — skeleton only for this pass (see project README:
-- the AI interviewer itself is not wired to a live LLM yet). This just
-- makes "Interview history" a real (currently-empty) query instead of
-- a hardcoded list.
-- ============================================================
create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  interview_type text not null default 'coding',
  status text not null default 'not_started',
  technical_score int,
  communication_score int,
  confidence_score int,
  problem_solving_score int,
  transcript jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.interview_sessions enable row level security;
create policy "Users manage their own interview sessions" on public.interview_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- VIEWS — real, computed leaderboard & platform stats.
-- ============================================================

-- Per-user aggregate stats, used by both the leaderboard and profile/dashboard.
create or replace view public.user_stats as
select
  p.id as user_id,
  p.username,
  p.full_name,
  p.avatar_url,
  coalesce(count(distinct s.problem_id) filter (where s.verdict = 'Accepted'), 0) as accepted_count,
  coalesce(count(distinct s.problem_id) filter (where s.verdict = 'Accepted' and pr.difficulty = 'Easy'), 0) as easy_solved,
  coalesce(count(distinct s.problem_id) filter (where s.verdict = 'Accepted' and pr.difficulty = 'Medium'), 0) as medium_solved,
  coalesce(count(distinct s.problem_id) filter (where s.verdict = 'Accepted' and pr.difficulty = 'Hard'), 0) as hard_solved,
  coalesce(count(s.id), 0) as total_submissions,
  case when count(s.id) = 0 then 0
       else round(100.0 * count(*) filter (where s.verdict = 'Accepted') / count(s.id))
  end as acceptance_rate
from public.profiles p
left join public.submissions s on s.user_id = p.id
left join public.problems pr on pr.id = s.problem_id
group by p.id, p.username, p.full_name, p.avatar_url;

-- Ranking formula: accepted problems weigh most, then hard solves, then accuracy.
-- (Streak is date-sequence logic, computed client-side from submission timestamps
-- rather than in SQL, and is not part of the stored ranking order here.)
create or replace view public.leaderboard as
select
  user_id, username, full_name, avatar_url,
  accepted_count, hard_solved, acceptance_rate,
  (accepted_count * 10 + hard_solved * 15 + acceptance_rate) as score,
  rank() over (order by (accepted_count * 10 + hard_solved * 15 + acceptance_rate) desc) as rank
from public.user_stats
where accepted_count > 0 or total_submissions > 0
order by score desc;

-- Public, real, aggregate platform stats for the landing page — replaces
-- the previous hardcoded "100K+ Users / 1M+ Problems Solved / ..." block.
create or replace view public.platform_stats as
select
  (select count(*) from public.profiles) as total_users,
  (select count(*) filter (where verdict = 'Accepted') from public.submissions) as total_accepted_submissions,
  (select count(*) from public.problems) as total_problems,
  (select count(distinct c) from public.problems, unnest(companies) as c) as total_companies;

grant select on public.user_stats to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;
grant select on public.platform_stats to anon, authenticated;
