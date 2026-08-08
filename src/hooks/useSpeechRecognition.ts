import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechRecognitionResult {
  isSupported: boolean;
  isListening: boolean;
  interimText: string;
  start: () => void;
  stop: () => void;
}

export function useSpeechRecognition(onFinalResult: (text: string) => void): UseSpeechRecognitionResult {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const isSupported = typeof window !== 'undefined' && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) return;
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalChunk = '';
      let interimChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += transcript;
        else interimChunk += transcript;
      }
      if (finalChunk) onFinalResult(finalChunk.trim());
      setInterimText(interimChunk);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setInterimText('');
    recognitionRef.current.start();
    setIsListening(true);
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  return { isSupported, isListening, interimText, start, stop };
}
