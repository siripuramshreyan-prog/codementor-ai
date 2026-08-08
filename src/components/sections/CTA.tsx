import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuroraBackground } from '../ui/AuroraBackground';
import { GlowButton } from '../ui/GlowButton';
import { ScrollReveal } from '../ui/ScrollReveal';
import { GlassCard } from '../ui/GlassCard';

export function CTA() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <GlassCard hover={false} className="relative overflow-hidden p-12 text-center sm:p-20">
            <AuroraBackground className="opacity-60" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                Start Coding <span className="text-gradient">Today</span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-slate-400">
                Join thousands of learners building real skills and landing real offers — no credit card required.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link to="/register">
                  <GlowButton size="lg" icon={<ArrowRight size={18} />}>
                    Get Started Free
                  </GlowButton>
                </Link>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>
    </section>
  );
}
