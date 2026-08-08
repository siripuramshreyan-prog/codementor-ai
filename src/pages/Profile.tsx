import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { Calendar, Award, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { useUserStats, useStreak, useSkillGraph } from '../hooks/useUserStats';
import { useSubmissions } from '../hooks/useSubmissions';
import { useBadgeDefinitions } from '../hooks/useBadges';
import { deriveBadges } from '../lib/badges';
import { cn } from '../lib/utils';

function initialsFor(name: string, email: string | undefined) {
  const source = name.trim() || email || '';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function Profile() {
  const { user, profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useUserStats(user?.id);
  const { data: streak } = useStreak(user?.id);
  const { data: skillGraph, isLoading: skillLoading } = useSkillGraph(user?.id);
  const { data: submissions } = useSubmissions(user?.id);
  const { data: badgeDefs } = useBadgeDefinitions();

  const derivedBadges = stats && badgeDefs ? deriveBadges(badgeDefs, stats, streak?.longestStreakDays ?? 0) : [];
  const recentActivity = (submissions ?? []).slice(0, 8);

  return (
    <DashboardLayout>
      <ScrollReveal>
        <GlassCard hover={false} className="relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-brand-violet/10 to-transparent" />
          <div className="relative flex flex-col items-center gap-6 sm:flex-row">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-violet text-2xl font-semibold text-white ring-4 ring-white/10">
              {initialsFor(profile?.full_name ?? '', user?.email)}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-semibold text-white">{profile?.full_name || profile?.username || 'Your Profile'}</h1>
              <p className="text-sm text-slate-400">@{profile?.username}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} /> Joined {profile ? new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : '—'}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </ScrollReveal>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ScrollReveal delay={0.05} className="lg:col-span-1">
          <GlassCard hover={false} className="p-6">
            <h3 className="text-sm font-semibold text-white">Skill Graph</h3>
            <p className="mt-1 text-xs text-slate-500">Computed from your accepted submissions, by topic.</p>
            <div className="mt-4 h-64">
              {skillLoading ? (
                <Skeleton className="h-full w-full" />
              ) : skillGraph && skillGraph.some((s) => s.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skillGraph}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Radar dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.35} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-500">
                  <p>No problems solved yet.</p>
                  <p className="mt-1 text-xs">Every category starts at 0 — solve problems to fill this in.</p>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard hover={false} className="mt-5 p-6">
            <h3 className="text-sm font-semibold text-white">Stats</h3>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-green-400">{statsLoading ? '—' : stats?.easy_solved ?? 0}</p>
                <p className="text-[11px] text-slate-500">Easy</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-400">{statsLoading ? '—' : stats?.medium_solved ?? 0}</p>
                <p className="text-[11px] text-slate-500">Medium</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-400">{statsLoading ? '—' : stats?.hard_solved ?? 0}</p>
                <p className="text-[11px] text-slate-500">Hard</p>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="lg:col-span-2">
          <GlassCard hover={false} className="p-6">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-brand-cyan" />
              <h3 className="text-sm font-semibold text-white">Badges</h3>
              <span className="text-xs text-slate-500">— unlocked only when you actually meet the requirement</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {derivedBadges.map((badge) => (
                <div
                  key={badge.code}
                  title={badge.description}
                  className={cn('flex flex-col items-center gap-2 rounded-xl2 p-4 text-center', badge.unlocked ? 'bg-white/5' : 'bg-white/[0.02]')}
                >
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', badge.unlocked ? 'bg-gradient-to-br from-brand-blue to-brand-violet' : 'bg-white/5 text-slate-600')}>
                    {badge.unlocked ? <Award size={18} className="text-white" /> : <Lock size={16} />}
                  </div>
                  <span className={cn('text-xs', badge.unlocked ? 'text-slate-200' : 'text-slate-600')}>{badge.name}</span>
                  {!badge.unlocked && <span className="text-[10px] text-slate-600">{Math.round(badge.progress * 100)}%</span>}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard hover={false} className="mt-5 p-6">
            <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
            {recentActivity.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">No activity yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {recentActivity.map((s) => (
                  <div key={s.id} className="flex items-start gap-3">
                    {s.verdict === 'Accepted' ? (
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-400" />
                    ) : (
                      <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm text-slate-200">
                        {s.verdict === 'Accepted' ? 'Solved' : 'Attempted'} a problem &mdash; <span className={s.verdict === 'Accepted' ? 'text-green-400' : 'text-red-400'}>{s.verdict}</span>
                      </p>
                      <p className="text-xs text-slate-500">{new Date(s.submitted_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </ScrollReveal>
      </div>
    </DashboardLayout>
  );
}
