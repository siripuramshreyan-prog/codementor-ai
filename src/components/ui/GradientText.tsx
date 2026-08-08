import type { ElementType, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GradientTextProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  animate?: boolean;
}

export function GradientText({ children, as: Tag = 'span', className, animate = false }: GradientTextProps) {
  return (
    <Tag className={cn('text-gradient', animate && 'animate-shimmer bg-[length:200%_auto]', className)}>
      {children}
    </Tag>
  );
}
