import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Marquee({ children, className, reverse = false }: { children: ReactNode; className?: string; reverse?: boolean }) {
  return (
    <div className={cn('relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]', className)}>
      <div
        className="flex shrink-0 items-center gap-10 animate-marquee"
        style={{ animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {children}
      </div>
      <div
        aria-hidden
        className="flex shrink-0 items-center gap-10 animate-marquee"
        style={{ animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {children}
      </div>
    </div>
  );
}
