import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Crown, Medal, Award, Trophy } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Topbar } from '../components/layout/Topbar';
import { GlassCard } from '../components/ui/GlassCard';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { Skeleton } from '../components/ui/Skeleton';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

function initialsFor(name: string, username: string) {
  const source = (name || username || '').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function Leaderboard() {
  const { user } = useAuth();
  const { data: leaderboard, isLoading, isError } = useLeaderboard();
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => (leaderboard ?? []).filter((p) => (p.full_name || p.username).toLowerCase().includes(query.toLowerCase())),
    [leaderboard, query]
  );

  const podium = (leaderboard ?? []).slice(0, 3);
  const rest = filtered.filter((p) => p.rank > 3);
  const isEmptyLeaderboard = !isLoading && !isError && (leaderboard?.length ?? 0) === 0;

  return (
    <DashboardLayout>
      <Topbar title="Leaderboard" subtitle="Ranked by accepted problems, hard solves, and accuracy." />

      {isLoading && (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      )}

      {isError && (
        <GlassCard hover={false} className="p-10 text-center text-sm text-slate-500">
          Couldn't load the leaderboard right now.
        </GlassCard>
      )}

      {isEmptyLeaderboard && (
        <GlassCard hover={false} className="flex flex-col items-center gap-3 p-12 text-center">
          <Trophy size={28} className="text-slate-600" />
          <p className="text-sm text-slate-400">No ranked users yet — the leaderboard fills in as people solve problems.</p>
        </GlassCard>
      )}

      {!isLoading && !isError && podium.length > 0 && (
        <div className="mb-8 grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
          {[podium[1], podium[0], podium[2]].filter(Boolean).map((p, i) => {
            const isFirst = p.rank === 1;
            return (
              <ScrollReveal key={p.user_id} delay={i * 0.1}>
                <GlassCard
                  glow={isFirst ? 'violet' : 'blue'}
                  hover={false}
                  className={cn('flex flex-col items-center p-6 text-center', isFirst && 'sm:-mt-6', p.user_id === user?.id && 'ring-1 ring-brand-cyan/40')}
                >
                  <div className="relative">
                    <div className={cn('flex items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-violet font-semibold text-white', isFirst ? 'h-20 w-20 text-xl' : 'h-16 w-16 text-lg')}>
                      {initialsFor(p.full_name, p.username)}
                    </div>
                    <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-void ring-2 ring-brand-navy">
                      {p.rank === 1 && <Crown size={15} className="text-yellow-400" />}
                      {p.rank === 2 && <Medal size={15} className="text-slate-300" />}
                      {p.rank === 3 && <Award size={15} className="text-amber-600" />}
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-white">{p.full_name || p.username}</p>
                  <p className="mt-1 text-xs text-slate-400">{p.score} pts &middot; {p.accepted_count} solved</p>
                  <span className={cn('mt-3 text-2xl font-bold', isFirst ? 'text-gradient' : 'text-slate-400')}>#{p.rank}</span>
                </GlassCard>
              </ScrollReveal>
            );
          })}
        </div>
      )}

      {!isLoading && !isError && (leaderboard?.length ?? 0) > 0 && (
        <GlassCard hover={false} className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-5">
            <div className="relative max-w-xs">
              <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search players..."
                aria-label="Search players"
                className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-slate-500">
                  <th scope="col" className="px-6 py-3 font-medium">Rank</th>
                  <th scope="col" className="px-6 py-3 font-medium">Player</th>
                  <th scope="col" className="px-6 py-3 font-medium">Score</th>
                  <th scope="col" className="px-6 py-3 font-medium">Solved</th>
                  <th scope="col" className="px-6 py-3 font-medium">Hard</th>
                  <th scope="col" className="px-6 py-3 font-medium">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {rest.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      {query ? `No players found matching "${query}".` : 'No more ranked players below the top 3 yet.'}
                    </td>
                  </tr>
                ) : (
                  rest.map((p, i) => (
                    <motion.tr
                      key={p.user_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn('border-t border-white/5 transition-colors hover:bg-white/[0.03]', p.user_id === user?.id && 'bg-brand-violet/5')}
                    >
                      <td className="px-6 py-4 font-mono text-slate-400">#{p.rank}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue/60 to-brand-violet/60 text-xs font-semibold text-white">
                            {initialsFor(p.full_name, p.username)}
                          </div>
                          <span className="font-medium text-white">{p.full_name || p.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{p.score}</td>
                      <td className="px-6 py-4 text-slate-300">{p.accepted_count}</td>
                      <td className="px-6 py-4 text-slate-300">{p.hard_solved}</td>
                      <td className="px-6 py-4 text-slate-300">{p.acceptance_rate}%</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </DashboardLayout>
  );
}
