import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function AnimatedCounter({ value, suffix = '', prefix = '', decimals = 0 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 30, stiffness: 60 });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      }
    });
  }, [spring, prefix, suffix, decimals]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}
