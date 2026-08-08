import { features } from '../../data/content';
import { GlassCard } from '../ui/GlassCard';
import { ScrollReveal } from '../ui/ScrollReveal';
import { GradientText } from '../ui/GradientText';

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cyan">Everything you need</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            One platform, <GradientText>every stage</GradientText> of your journey
          </h2>
          <p className="mt-4 text-slate-400">
            From your first loop to your final round — practice, feedback, and progress tracking in one place.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={(i % 3) * 0.08}>
              <GlassCard className="group h-full p-6" glow="violet">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl2 bg-gradient-to-br from-brand-blue/20 to-brand-violet/20 text-brand-cyan transition-transform duration-300 group-hover:scale-110 group-hover:text-white">
                  <feature.icon size={20} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.description}</p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
