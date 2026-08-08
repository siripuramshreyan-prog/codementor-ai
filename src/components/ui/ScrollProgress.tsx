import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[70] h-[3px] w-full origin-left bg-gradient-to-r from-brand-blue via-brand-violet to-brand-cyan"
    />
  );
}
