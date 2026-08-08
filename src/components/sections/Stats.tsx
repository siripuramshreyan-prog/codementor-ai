import { usePlatformStats } from '../../hooks/usePlatformStats';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { ScrollReveal } from '../ui/ScrollReveal';
import { GlassCard } from '../ui/GlassCard';
import { Skeleton } from '../ui/Skeleton';

export function Stats() {
  const { data, isLoading, isError } = usePlatformStats();

  // Real, live counts from the database — no hardcoded numbers. A brand-new
  // project genuinely has small numbers here, and that's the honest state.
  const items = data
    ? [
        { value: data.total_users, suffix: '+', label: 'Registered Users' },
        { value: data.total_problems, suffix: '', label: 'Problems Available' },
        { value: data.total_accepted_submissions, suffix: '+', label: 'Problems Solved' },
        { value: data.total_companies, suffix: '+', label: 'Companies Tagged' },
      ]
    : [];

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <GlassCard hover={false} className="grid grid-cols-2 gap-8 p-8 sm:p-12 lg:grid-cols-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}

          {isError && (
            <p className="col-span-2 text-center text-sm text-slate-500 lg:col-span-4">
              Live platform stats are unavailable right now.
            </p>
          )}

          {!isLoading &&
            !isError &&
            items.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.1} className="text-center">
                <div className="text-3xl font-bold text-white sm:text-4xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
              </ScrollReveal>
            ))}
        </GlassCard>
      </div>
    </section>
  );
}
