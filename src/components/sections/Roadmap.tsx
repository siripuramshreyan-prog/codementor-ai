import { Sparkles } from 'lucide-react';
import { roadmapStages } from '../../data/content';
import { GlassCard } from '../ui/GlassCard';
import { ScrollReveal } from '../ui/ScrollReveal';
import { GradientText } from '../ui/GradientText';

export function Roadmap() {
  return (
    <section id="roadmap" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cyan">Your path</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            A roadmap that <GradientText>adapts to you</GradientText>
          </h2>
          <p className="mt-4 text-slate-400">
            Four stages, each unlocked by mastery — not a calendar. The AI recommends what to tackle next.
          </p>
        </ScrollReveal>

        <div className="relative mt-16">
          <div className="absolute left-[27px] top-2 bottom-2 hidden w-px bg-gradient-to-b from-brand-blue via-brand-violet to-brand-cyan sm:block lg:left-1/2" />

          <div className="space-y-6 lg:space-y-10">
            {roadmapStages.map((stage, i) => (
              <ScrollReveal
                key={stage.level}
                delay={i * 0.1}
                direction={i % 2 === 0 ? 'right' : 'left'}
                className={`relative lg:flex ${i % 2 === 0 ? 'lg:justify-start' : 'lg:justify-end'}`}
              >
                <div className={`flex gap-5 lg:w-[calc(50%-2rem)] ${i % 2 !== 0 ? 'lg:flex-row-reverse lg:text-right' : ''}`}>
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-violet font-mono text-sm font-bold text-white shadow-[0_0_25px_-4px_rgba(139,92,246,0.6)]">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <GlassCard className="flex-1 p-6">
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">{stage.level}</span>
                    <h3 className="mt-1.5 text-lg font-semibold text-white">{stage.title}</h3>
                    <p className="mt-2 text-sm text-slate-400">{stage.description}</p>
                    <div className={`mt-4 flex flex-wrap gap-2 ${i % 2 !== 0 ? 'lg:justify-end' : ''}`}>
                      {stage.topics.map((topic) => (
                        <span key={topic} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal delay={0.2}>
          <GlassCard glow="cyan" className="mt-10 flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-cyan/15 text-brand-cyan">
              <Sparkles size={22} />
            </div>
            <div>
              <h4 className="font-semibold text-white">AI Recommended Path</h4>
              <p className="mt-1 text-sm text-slate-400">
                Based on your recent activity, the AI suggests focusing on graph traversal and system design fundamentals next.
              </p>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
