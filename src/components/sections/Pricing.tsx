import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pricingPlans } from '../../data/content';
import { GlassCard } from '../ui/GlassCard';
import { GlowButton } from '../ui/GlowButton';
import { ScrollReveal } from '../ui/ScrollReveal';
import { GradientText } from '../ui/GradientText';
import { cn } from '../../lib/utils';

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cyan">Pricing</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple pricing, <GradientText>serious results</GradientText>
          </h2>
          <p className="mt-4 text-slate-400">Start free. Upgrade when you're ready to go all in on interview prep.</p>
        </ScrollReveal>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.1}>
              <GlassCard
                glow={plan.highlighted ? 'violet' : 'blue'}
                className={cn(
                  'relative flex h-full flex-col p-8',
                  plan.highlighted && 'border-brand-violet/40 shadow-[0_0_60px_-15px_rgba(139,92,246,0.5)]'
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-blue to-brand-violet px-4 py-1 text-xs font-semibold text-white shadow-lg">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  {plan.price === null ? (
                    <span className="text-3xl font-bold text-white">Custom</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-white">${plan.price}</span>
                      <span className="text-sm text-slate-400">/month</span>
                    </>
                  )}
                </div>

                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check size={16} className="mt-0.5 shrink-0 text-brand-cyan" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to="/register" className="mt-8">
                  <GlowButton
                    variant={plan.highlighted ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {plan.cta}
                  </GlowButton>
                </Link>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
