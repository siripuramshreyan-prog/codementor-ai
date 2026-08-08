import { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuroraBackground } from '../ui/AuroraBackground';
import { FloatingOrb } from '../ui/FloatingOrb';
import { GlowButton } from '../ui/GlowButton';
import { GlassCard } from '../ui/GlassCard';
import { TypingText } from '../ui/TypingText';
import { Modal } from '../ui/Modal';

gsap.registerPlugin(ScrollTrigger);

const typingWords = ['Great use of a hash map \u2014 O(n) time.', 'Try naming `need` more descriptively.'];

const codeLines = [
  { indent: 0, text: 'function twoSum(nums, target) {' },
  { indent: 1, text: 'const seen = new Map();' },
  { indent: 1, text: 'for (let i = 0; i < nums.length; i++) {' },
  { indent: 2, text: 'const need = target - nums[i];' },
  { indent: 2, text: 'if (seen.has(need)) return [seen.get(need), i];' },
  { indent: 2, text: 'seen.set(nums[i], i);' },
  { indent: 1, text: '}' },
  { indent: 0, text: '}' },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const orbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [demoOpen, setDemoOpen] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      orbRefs.current.forEach((orb, i) => {
        if (!orb) return;
        // Each orb drifts at a different speed as the hero scrolls out of view.
        gsap.to(orb, {
          yPercent: 30 + i * 15,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden pb-24 pt-40 sm:pb-32 sm:pt-48">
      <AuroraBackground />
      <div ref={(el) => { orbRefs.current[0] = el; }}>
        <FloatingOrb size={120} color="blue" className="left-[6%] top-[22%]" delay="0s" />
      </div>
      <div ref={(el) => { orbRefs.current[1] = el; }}>
        <FloatingOrb size={90} color="cyan" className="right-[10%] top-[15%]" delay="-2s" />
      </div>
      <div ref={(el) => { orbRefs.current[2] = el; }}>
        <FloatingOrb size={70} color="violet" className="bottom-[10%] left-[16%]" delay="-4s" />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-slate-300"
          >
            <Sparkles size={13} className="text-brand-cyan" />
            Now with real-time AI interview scoring
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Learn Coding <br />
            with <span className="text-gradient">AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg text-slate-400"
          >
            Practice coding, prepare for interviews, compete with friends, and become job ready using AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link to="/register">
              <GlowButton size="lg" icon={<ArrowRight size={18} />}>
                Get Started
              </GlowButton>
            </Link>
            <GlowButton variant="ghost" size="lg" icon={<PlayCircle size={18} />} onClick={() => setDemoOpen(true)}>
              Watch Demo
            </GlowButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 font-mono text-xs uppercase tracking-[0.25em] text-slate-500"
          >
            Trusted by thousands
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-8 -z-10 rounded-full bg-gradient-to-br from-brand-blue/20 via-brand-violet/20 to-brand-cyan/20 blur-3xl animate-glow-pulse" />

          <GlassCard glow="violet" className="animate-float p-5" hover={false}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
              </div>
              <span className="font-mono text-[11px] text-slate-500">solution.js</span>
            </div>
            <div className="space-y-1.5 font-mono text-[13px] leading-relaxed">
              {codeLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.09, duration: 0.4 }}
                  style={{ paddingLeft: line.indent * 16 }}
                  className="text-slate-300"
                >
                  <span className="text-brand-cyan/80">{line.text}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <motion.div
            initial={{ opacity: 0, y: 20, x: -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            className="absolute -bottom-8 -left-10 w-56"
          >
            <GlassCard glow="cyan" className="animate-float-slow p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-cyan/15 text-brand-cyan">
                  <Sparkles size={12} />
                </span>
                AI Feedback
              </div>
              <TypingText
                words={typingWords}
                className="mt-2 block text-[13px] text-slate-200"
              />
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -16, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.7, delay: 1.3 }}
            className="absolute -right-6 -top-8"
          >
            <GlassCard glow="blue" className="animate-float px-4 py-3 text-center" style={{ animationDelay: '-3s' }}>
              <div className="text-lg font-bold text-white">98%</div>
              <div className="text-[10px] text-slate-400">Match Score</div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>

      <Modal open={demoOpen} onClose={() => setDemoOpen(false)} title="Product Demo">
        <div className="flex aspect-video items-center justify-center rounded-xl2 bg-white/5 text-slate-500">
          <div className="text-center">
            <PlayCircle size={40} className="mx-auto text-slate-600" />
            <p className="mt-3 text-sm">Demo video coming soon.</p>
          </div>
        </div>
      </Modal>
    </section>
  );
}
