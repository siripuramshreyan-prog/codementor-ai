import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { faqs } from '../../data/content';
import { GlassCard } from '../ui/GlassCard';
import { ScrollReveal } from '../ui/ScrollReveal';
import { GradientText } from '../ui/GradientText';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-cyan">FAQ</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Questions, <GradientText>answered</GradientText>
          </h2>
        </ScrollReveal>

        <div className="mt-14 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <ScrollReveal key={item.q} delay={i * 0.05}>
                <GlassCard hover={false} className="overflow-hidden p-0">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-sm font-medium text-white sm:text-base">{item.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5 text-slate-400"
                    >
                      <ChevronDown size={15} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
