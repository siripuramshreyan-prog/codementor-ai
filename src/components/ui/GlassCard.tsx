import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
  glow?: 'blue' | 'violet' | 'cyan' | 'none';
}

const glowMap = {
  blue: 'hover:shadow-[0_0_50px_-12px_rgba(59,130,246,0.45)]',
  violet: 'hover:shadow-[0_0_50px_-12px_rgba(139,92,246,0.45)]',
  cyan: 'hover:shadow-[0_0_50px_-12px_rgba(6,182,212,0.45)]',
  none: '',
};

/** Base glass panel used across the app: blurred surface, soft border, optional lift + glow on hover. */
export function GlassCard({ className, hover = true, glow = 'violet', children, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        'glass rounded-[20px] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]',
        hover && 'transition-shadow duration-500',
        hover && glowMap[glow],
        className
      )}
      whileHover={hover ? { y: -6 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
