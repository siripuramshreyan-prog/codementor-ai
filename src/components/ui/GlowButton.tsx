import { useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  magnetic?: boolean;
}

const variants = {
  primary:
    'bg-gradient-to-r from-brand-blue via-brand-violet to-brand-cyan bg-[length:200%_auto] text-white shadow-[0_0_30px_-6px_rgba(139,92,246,0.6)] hover:bg-[position:100%_0] hover:shadow-[0_0_45px_-4px_rgba(139,92,246,0.85)]',
  ghost: 'bg-white/5 text-slate-100 hover:bg-white/10 border border-white/10',
  outline: 'bg-transparent text-slate-100 border border-white/15 hover:border-brand-cyan/60 hover:text-brand-cyan',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

/** Magnetic button: tracks pointer position and nudges toward it, per the brief's "magnetic buttons" requirement. */
export function GlowButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon,
  magnetic = true,
  ...props
}: GlowButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const isDisabled = Boolean(props.disabled);

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (!magnetic || isDisabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
    setPos({ x, y });
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15, mass: 0.5 }}
      whileTap={isDisabled ? undefined : { scale: 0.96 }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 select-none',
        isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      {...(props as any)}
    >
      {icon}
      {children}
    </motion.button>
  );
}
