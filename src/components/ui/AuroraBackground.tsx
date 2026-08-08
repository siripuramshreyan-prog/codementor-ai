import { cn } from '../../lib/utils';

/** Full-bleed animated aurora mesh used behind hero/CTA sections. Purely decorative — aria-hidden. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <div className="absolute -top-1/3 left-1/4 h-[60vw] w-[60vw] rounded-full bg-brand-blue/30 blur-[120px] animate-aurora" />
      <div
        className="absolute top-1/4 -right-1/4 h-[50vw] w-[50vw] rounded-full bg-brand-violet/30 blur-[120px] animate-aurora"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="absolute -bottom-1/3 left-1/3 h-[55vw] w-[55vw] rounded-full bg-brand-cyan/20 blur-[130px] animate-aurora"
        style={{ animationDelay: '-12s' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-brand-void)_75%)]" />
    </div>
  );
}
