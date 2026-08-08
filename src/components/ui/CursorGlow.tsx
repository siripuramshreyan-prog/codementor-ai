import { useEffect, useRef } from 'react';

/**
 * Global mouse-follower glow. Uses a ref + direct style writes (no React state)
 * so it never triggers re-renders while the pointer moves.
 */
export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    let raf = 0;
    let gx = 0,
      gy = 0,
      tx = 0,
      ty = 0;

    function onMove(e: MouseEvent) {
      tx = e.clientX;
      ty = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${tx - 4}px, ${ty - 4}px, 0)`;
      }
    }

    function tick() {
      gx += (tx - gx) * 0.08;
      gy += (ty - gy) * 0.08;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${gx - 200}px, ${gy - 200}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden md:block" aria-hidden>
      <div
        ref={glowRef}
        className="absolute h-[400px] w-[400px] rounded-full bg-brand-violet/[0.07] blur-[80px] will-change-transform"
      />
      <div
        ref={dotRef}
        className="absolute h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_12px_3px_rgba(6,182,212,0.7)] will-change-transform"
      />
    </div>
  );
}
