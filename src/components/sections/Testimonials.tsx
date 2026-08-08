import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials } from '../../data/content';
import { GlassCard } from '../ui/GlassCard';
import { ScrollReveal } from '../ui/ScrollReveal';
import { GradientText } from '../ui/GradientText';

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const t = testimonials[index];

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cyan">Loved by learners</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Real progress, <GradientText>real stories</GradientText>
          </h2>
        </ScrollReveal>

        <div
          className="relative mt-16"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassCard hover={false} className="relative p-8 sm:p-12">
                <Quote className="absolute right-8 top-8 text-white/5" size={64} />
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < t.rating ? 'fill-brand-cyan text-brand-cyan' : 'text-white/15'} />
                  ))}
                </div>
                <p className="relative mt-5 text-lg leading-relaxed text-slate-200 sm:text-xl">"{t.quote}"</p>
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-violet text-sm font-semibold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
              aria-label="Previous testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-6 bg-brand-cyan' : 'w-1.5 bg-white/20'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
              aria-label="Next testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
