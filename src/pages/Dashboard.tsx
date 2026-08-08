import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Flame, Trophy, Target, Percent, ArrowUpRight, Sparkles, Bookmark } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Topbar } from '../components/layout/Topbar';
import { GlassCard } from '../components/ui/GlassCard';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { useUserStats, useStreak } from '../hooks/useUserStats';
import { useSubmissions } from '../hooks/useSubmissions';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useRecommendations } from '../hooks/useRecommendations';
import { useBookmarks } from '../hooks/useBookmarks';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Heatmap({ activeDates }: { activeDates: Set<string> }) {
  const weeks = 18;
  const cells = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result: { date: string; active: boolean }[] = [];
    for (let i = weeks * 7 - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, active: activeDates.has(key) });
    }
    return result;
  }, [activeDates]);

  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
      {cells.map((cell) => (
        <div
          key={cell.date}
          className={`h-3 w-3 rounded-sm ${cell.active ? 'bg-brand-cyan/80' : 'bg-white/5'}`}
          title={`${cell.date}${cell.active ? ' — solved a problem' : ''}`}
        />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useUserStats(user?.id);
  const { data: streak, isLoading: streakLoading } = useStreak(user?.id);
  const { data: submissions } = useSubmissions(user?.id);
  const { data: leaderboard } = useLeaderboard();
  const { data: recommendations, isLoading: recLoading } = useRecommendations(user?.id);
  const { data: bookmarks } = useBookmarks(user?.id);

  const myRank = leaderboard?.find((row) => row.user_id === user?.id)?.rank ?? null;

  const activityData = useMemo(() => {
    const counts = new Array(7).fill(0);
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    for (const s of submissions ?? []) {
      const d = new Date(s.submitted_at);
      if (d >= sevenDaysAgo) counts[d.getDay()]++;
    }
    // Rotate so the array reads Mon..Sun ending today, matching a typical weekly view.
    return DAY_LABELS.map((day, i) => ({ day, solved: counts[i] }));
  }, [submissions]);

  const firstName = profile?.full_name?.split(' ')[0] || profile?.username || 'there';

  return (
    <DashboardLayout>
      <Topbar title={`Welcome back, ${firstName}`} subtitle="Here's how your prep is trending this week." streakDays={streak?.currentStreakDays} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading || streakLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <ScrollReveal delay={0}>
              <GlassCard className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl2 bg-orange-400/10 text-orange-400">
                  <Flame size={18} />
                </div>
                <div className="mt-4 text-2xl font-bold text-white"><AnimatedCounter value={streak?.currentStreakDays ?? 0} /></div>
                <div className="mt-1 text-xs text-slate-400">Day Streak</div>
              </GlassCard>
            </ScrollReveal>
            <ScrollReveal delay={0.06}>
              <GlassCard className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl2 bg-brand-cyan/10 text-brand-cyan">
                  <Trophy size={18} />
                </div>
                <div className="mt-4 text-2xl font-bold text-white">{myRank ? <AnimatedCounter value={myRank} prefix="#" /> : '—'}</div>
                <div className="mt-1 text-xs text-slate-400">Global Rank</div>
              </GlassCard>
            </ScrollReveal>
            <ScrollReveal delay={0.12}>
              <GlassCard className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl2 bg-brand-violet/10 text-brand-violet">
                  <Target size={18} />
                </div>
                <div className="mt-4 text-2xl font-bold text-white"><AnimatedCounter value={stats?.accepted_count ?? 0} /></div>
                <div className="mt-1 text-xs text-slate-400">Problems Solved</div>
              </GlassCard>
            </ScrollReveal>
            <ScrollReveal delay={0.18}>
              <GlassCard className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl2 bg-brand-blue/10 text-brand-blue">
                  <Percent size={18} />
                </div>
                <div className="mt-4 text-2xl font-bold text-white"><AnimatedCounter value={stats?.acceptance_rate ?? 0} suffix="%" /></div>
                <div className="mt-1 text-xs text-slate-400">Acceptance Rate</div>
              </GlassCard>
            </ScrollReveal>
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ScrollReveal className="lg:col-span-2">
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Weekly Activity</h3>
              <span className="text-xs text-slate-500">Last 7 days</span>
            </div>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ left: -20, top: 10 }}>
                  <defs>
                    <linearGradient id="solvedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="solved" stroke="#8B5CF6" strokeWidth={2} fill="url(#solvedGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Contribution Heatmap</h3>
                <span className="text-xs text-slate-500">Last 18 weeks</span>
              </div>
              <div className="mt-4">
                {streak ? <Heatmap activeDates={streak.activeDates} /> : <Skeleton className="h-24 w-full" />}
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>

        <div className="flex flex-col gap-5">
          <ScrollReveal delay={0.1}>
            <GlassCard glow="cyan" className="p-6" hover={false}>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles size={15} className="text-brand-cyan" />
                Recommended For You
              </div>
              {recLoading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : recommendations && recommendations.problems.length > 0 ? (
                <>
                  <p className="mt-3 text-xs text-slate-400">{recommendations.reason}</p>
                  <div className="mt-4 space-y-3">
                    {recommendations.problems.map((p) => (
                      <Link key={p.id} to={`/problems/${p.slug}`} className="block rounded-xl2 bg-white/5 p-3.5 transition-colors hover:bg-white/10">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-white">{p.title}</p>
                          <ArrowUpRight size={14} className="mt-0.5 shrink-0 text-slate-500" />
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <span className="rounded-full bg-white/5 px-2 py-0.5">{p.difficulty}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No recommendations yet — solve a few problems to unlock personalized picks.</p>
              )}
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Bookmark size={15} className="text-brand-cyan" /> Bookmarks
              </div>
              {!bookmarks || bookmarks.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No bookmarks yet. Save problems from the Problems page to revisit them here.</p>
              ) : (
                <div className="mt-4 space-y-2">
                  {bookmarks.slice(0, 5).map((b: any) => (
                    <Link key={b.problem_id} to={`/problems/${b.problems?.slug}`} className="flex items-center justify-between rounded-xl2 bg-white/5 px-3.5 py-2.5 text-sm text-slate-200 hover:bg-white/10">
                      {b.problems?.title}
                      <span className="text-xs text-slate-500">{b.problems?.difficulty}</span>
                    </Link>
                  ))}
                </div>
              )}
            </GlassCard>
          </ScrollReveal>
        </div>
      </div>
    </DashboardLayout>
  );
}
