export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Verdict =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Compilation Error'
  | 'Runtime Error'
  | 'Presentation Error';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  location: string;
  website: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  constraints: string;
  topics: string[];
  companies: string[];
  starter_code: Record<string, string>;
  order_index: number;
  created_at: string;
}

export interface ProblemExample {
  id: string;
  problem_id: string;
  order_index: number;
  input: string;
  output: string;
  explanation: string | null;
}

export interface Submission {
  id: string;
  user_id: string;
  problem_id: string;
  language: string;
  code: string;
  verdict: Verdict;
  runtime_ms: number | null;
  memory_kb: number | null;
  passed_count: number;
  total_count: number;
  failed_testcase: { input: string; expected: string; actual: string } | null;
  submitted_at: string;
}

export interface UserSettings {
  user_id: string;
  theme: string;
  language: string;
  email_daily_reminders: boolean;
  email_contest_announcements: boolean;
  email_ai_feedback: boolean;
  email_weekly_summary: boolean;
  email_product_updates: boolean;
  two_factor_enabled: boolean;
  updated_at: string;
}

export interface Bookmark {
  user_id: string;
  problem_id: string;
  created_at: string;
}

export interface BadgeDefinition {
  code: string;
  name: string;
  description: string;
  requirement_type: 'accepted_count' | 'streak_days' | 'hard_solved' | 'acceptance_rate';
  requirement_value: number;
  requirement_meta: string | null;
}

export interface UserStats {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  accepted_count: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  total_submissions: number;
  acceptance_rate: number;
}

export interface LeaderboardRow {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  accepted_count: number;
  hard_solved: number;
  acceptance_rate: number;
  score: number;
  rank: number;
}

export interface PlatformStats {
  total_users: number;
  total_accepted_submissions: number;
  total_problems: number;
  total_companies: number;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  interview_type: string;
  status: string;
  technical_score: number | null;
  communication_score: number | null;
  confidence_score: number | null;
  problem_solving_score: number | null;
  transcript: unknown;
  created_at: string;
  completed_at: string | null;
}
