import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

const offsets = {
  up: { y: 32, x: 0 },
  down: { y: -32, x: 0 },
  left: { y: 0, x: 32 },
  right: { y: 0, x: -32 },
  none: { y: 0, x: 0 },
};

export function ScrollReveal({ children, delay = 0, direction = 'up', className }: ScrollRevealProps) {
  const offset = offsets[direction];
  const variants: Variants = {
    hidden: { opacity: 0, y: offset.y, x: offset.x },
    visible: { opacity: 1, y: 0, x: 0, transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}
