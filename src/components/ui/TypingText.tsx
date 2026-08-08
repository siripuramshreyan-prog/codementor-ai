import { useEffect, useState } from 'react';

interface TypingTextProps {
  words: string[];
  className?: string;
}

export function TypingText({ words, className }: TypingTextProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex % words.length];
    const speed = deleting ? 35 : 65;

    const timeout = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, text.length + 1);
        setText(next);
        if (next === current) setTimeout(() => setDeleting(true), 1400);
      } else {
        const next = current.slice(0, text.length - 1);
        setText(next);
        if (next === '') {
          setDeleting(false);
          setWordIndex((i) => i + 1);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, deleting, wordIndex, words]);

  return (
    <span className={className}>
      {text}
      <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-brand-cyan align-middle" style={{ height: '0.9em' }} />
    </span>
  );
}
