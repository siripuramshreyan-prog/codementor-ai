import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + (100 - p) * 0.18;
        return next > 99.4 ? 100 : next;
      });
    }, 90);

    const timeout = setTimeout(() => setVisible(false), 1400);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-brand-void"
          exit={{ opacity: 0, filter: 'blur(8px)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <div className="relative h-16 w-16">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-blue border-r-brand-violet"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-transparent border-b-brand-cyan"
              animate={{ rotate: -360 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <p className="font-mono text-xs tracking-[0.3em] text-slate-400">
            {Math.round(progress)}% · COMPILING EXPERIENCE
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
