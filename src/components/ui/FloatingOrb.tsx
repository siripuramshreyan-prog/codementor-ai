import { cn } from '../../lib/utils';

interface FloatingOrbProps {
  size?: number;
  color?: 'blue' | 'violet' | 'cyan';
  className?: string;
  delay?: string;
}

const colorMap = {
  blue: 'bg-brand-blue/40',
  violet: 'bg-brand-violet/40',
  cyan: 'bg-brand-cyan/40',
};

export function FloatingOrb({ size = 80, color = 'violet', className, delay = '0s' }: FloatingOrbProps) {
  return (
    <div
      aria-hidden
      className={cn('absolute rounded-full blur-2xl animate-float-slow', colorMap[color], className)}
      style={{ width: size, height: size, animationDelay: delay }}
    />
  );
}
