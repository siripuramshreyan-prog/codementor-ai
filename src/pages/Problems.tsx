import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, CheckCircle2, Bookmark } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Topbar } from '../components/layout/Topbar';
import { GlassCard } from '../components/ui/GlassCard';
import { Skeleton } from '../components/ui/Skeleton';
import { useProblems } from '../hooks/useProblems';
import { useAuth } from '../contexts/AuthContext';
import { useSubmissions } from '../hooks/useSubmissions';
import { useBookmarks } from '../hooks/useBookmarks';
import { ALL_TOPICS } from '../data/topics';
import { cn } from '../lib/utils';
import type { Difficulty } from '../lib/database.types';

const difficultyColor: Record<Difficulty, string> = {
  Easy: 'text-green-400 bg-green-400/10',
  Medium: 'text-yellow-400 bg-yellow-400/10',
  Hard: 'text-red-400 bg-red-400/10',
};

export default function Problems() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All');
  const [topic, setTopic] = useState<string>('All');

  const { data: problems, isLoading, isError } = useProblems({ search, difficulty, topic });
  const { data: submissions } = useSubmissions(user?.id);
  const { data: bookmarks } = useBookmarks(user?.id);

  const solvedProblemIds = useMemo(
    () => new Set((submissions ?? []).filter((s) => s.verdict === 'Accepted').map((s) => s.problem_id)),
    [submissions]
  );
  const bookmarkedIds = useMemo(() => new Set((bookmarks ?? []).map((b: any) => b.problem_id)), [bookmarks]);

  return (
    <DashboardLayout>
      <Topbar title="Problems" subtitle={`${problems?.length ?? 0} problem${problems?.length === 1 ? '' : 's'} matching your filters`} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems by title..."
            aria-label="Search problems"
            className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
          />
        </div>
        <div className="flex gap-1.5">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              aria-pressed={difficulty === d}
              className={cn(
                'rounded-full px-3.5 py-2 text-xs font-medium transition-colors',
                difficulty === d ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setTopic('All')}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs transition-colors',
            topic === 'All' ? 'bg-brand-violet/20 text-brand-cyan' : 'bg-white/5 text-slate-400 hover:text-slate-200'
          )}
        >
          All Topics
        </button>
        {ALL_TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs transition-colors',
              topic === t ? 'bg-brand-violet/20 text-brand-cyan' : 'bg-white/5 text-slate-400 hover:text-slate-200'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <GlassCard hover={false} className="mt-6 overflow-hidden p-0">
        {isLoading && (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <div className="p-10 text-center text-sm text-slate-500">
            Couldn't load problems right now. Check your Supabase connection (see SETUP.md) and try again.
          </div>
        )}

        {!isLoading && !isError && (problems?.length ?? 0) === 0 && (
          <div className="p-10 text-center text-sm text-slate-500">
            {topic !== 'All'
              ? `No problems tagged "${topic}" yet. The problem library is still growing — see sql/02_seed_problems.sql to add more.`
              : 'No problems match your search.'}
          </div>
        )}

        {!isLoading && !isError && (problems?.length ?? 0) > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                <th scope="col" className="px-6 py-3 font-medium">Status</th>
                <th scope="col" className="px-6 py-3 font-medium">Title</th>
                <th scope="col" className="px-6 py-3 font-medium">Difficulty</th>
                <th scope="col" className="px-6 py-3 font-medium">Topics</th>
              </tr>
            </thead>
            <tbody>
              {problems!.map((p) => (
                <tr key={p.id} className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]">
                  <td className="px-6 py-4">
                    {solvedProblemIds.has(p.id) ? (
                      <CheckCircle2 size={16} className="text-green-400" aria-label="Solved" />
                    ) : (
                      <span className="block h-4 w-4 rounded-full border border-white/15" aria-label="Not solved" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/problems/${p.slug}`} className="font-medium text-white hover:text-brand-cyan">
                      {p.title}
                    </Link>
                    {bookmarkedIds.has(p.id) && <Bookmark size={12} className="ml-2 inline text-brand-cyan" fill="currentColor" />}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs', difficultyColor[p.difficulty])}>{p.difficulty}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {p.topics.slice(0, 3).map((t) => (
                        <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-slate-400">{t}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </DashboardLayout>
  );
}
