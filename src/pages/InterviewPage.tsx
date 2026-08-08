import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Sparkles, Clock, PhoneOff, MonitorUp, Send, AlertCircle, History } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { useAuth } from '../contexts/AuthContext';
import {
  useStartInterview,
  useRespondToInterview,
  useEndInterview,
  useInterviewHistory,
  type InterviewType,
  type TranscriptTurn,
} from '../hooks/useAiInterview';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { cn } from '../lib/utils';

const interviewTypes: { id: InterviewType; label: string; description: string }[] = [
  { id: 'coding', label: 'Coding', description: 'Algorithms & data structures, live problem-solving.' },
  { id: 'behavioral', label: 'Behavioral', description: 'STAR-format questions about past experience.' },
  { id: 'system_design', label: 'System Design', description: 'Architecture, trade-offs, and scaling.' },
];

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.02;
  window.speechSynthesis.speak(utterance);
}

export default function InterviewPage() {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [composerText, setComposerText] = useState('');
  const [finalScores, setFinalScores] = useState<{ technical_score: number; communication_score: number; confidence_score: number; problem_solving_score: number; summary: string } | null>(null);

  const startInterview = useStartInterview();
  const respond = useRespondToInterview();
  const endInterview = useEndInterview();
  const { data: history } = useInterviewHistory(user?.id);

  const speech = useSpeechRecognition((text) => setComposerText((prev) => (prev ? `${prev} ${text}` : text)));

  const status: 'setup' | 'in_progress' | 'completed' = finalScores ? 'completed' : sessionId ? 'in_progress' : 'setup';

  useEffect(() => {
    if (status !== 'in_progress') return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  // Camera lifecycle — stops tracks on toggle-off, unmount, and race conditions
  // (see the earlier UI-audit fix; carried over unchanged here).
  useEffect(() => {
    if (!camOn) {
      const stream = videoRef.current?.srcObject as MediaStream | undefined;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }
    let active = true;
    let acquiredStream: MediaStream | undefined;
    navigator.mediaDevices
      ?.getUserMedia({ video: true })
      .then((stream) => {
        acquiredStream = stream;
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setCamOn(false));
    return () => {
      active = false;
      acquiredStream?.getTracks().forEach((t) => t.stop());
    };
  }, [camOn]);

  async function toggleScreenShare() {
    if (screenSharing) {
      setScreenSharing(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenSharing(true);
      // Real capture, stopped as soon as the browser's native "stop sharing"
      // control is used — this pass does not analyze the shared screen content.
      stream.getVideoTracks()[0].addEventListener('ended', () => setScreenSharing(false));
    } catch {
      setScreenSharing(false);
    }
  }

  async function handleStart(type: InterviewType) {
    setFinalScores(null);
    setSeconds(0);
    const result = await startInterview.mutateAsync(type);
    setSessionId(result.session_id);
    setTranscript(result.transcript);
    speak(result.message);
  }

  async function handleSend() {
    if (!composerText.trim() || !sessionId) return;
    const message = composerText.trim();
    setComposerText('');
    setTranscript((prev) => [...prev, { role: 'candidate', text: message, at: new Date().toISOString() }]);
    const result = await respond.mutateAsync({ sessionId, message });
    setTranscript(result.transcript);
    speak(result.message);
  }

  async function handleEnd() {
    if (!sessionId) return;
    const scores = await endInterview.mutateAsync(sessionId);
    setFinalScores(scores);
    window.speechSynthesis?.cancel();
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  if (status === 'setup') {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold text-white">AI Interview</h1>
          <p className="mt-2 text-sm text-slate-400">
            A real conversation with an AI interviewer (Google Gemini) — it asks real follow-up questions based on
            what you actually say, and never reveals hints or solutions during the interview.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {interviewTypes.map((t) => (
              <GlassCard key={t.id} className="cursor-pointer p-5" onClick={() => handleStart(t.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleStart(t.id); }}>
                <h3 className="text-sm font-semibold text-white">{t.label}</h3>
                <p className="mt-2 text-xs text-slate-400">{t.description}</p>
              </GlassCard>
            ))}
          </div>

          {startInterview.isError && (
            <div role="alert" className="mt-6 flex items-start gap-2 rounded-xl2 border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {startInterview.error instanceof Error ? startInterview.error.message : 'Could not start the interview.'}
            </div>
          )}
          {startInterview.isPending && <p className="mt-6 text-sm text-slate-500">Connecting to your AI interviewer...</p>}

          <div className="mt-12">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <History size={16} className="text-brand-cyan" /> Interview History
            </div>
            {!history || history.length === 0 ? (
              <p className="text-sm text-slate-500">No interviews yet — your completed sessions will show up here.</p>
            ) : (
              <div className="space-y-2">
                {history.map((h: any) => (
                  <GlassCard key={h.id} hover={false} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium text-white capitalize">{h.interview_type.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500">{new Date(h.created_at).toLocaleString()}</p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {h.status === 'completed' ? `Technical: ${h.technical_score ?? '—'}` : 'In progress'}
                    </span>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <GlassCard hover={false} className="relative flex aspect-video items-center justify-center overflow-hidden p-0">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-void" />

            <div className="relative flex flex-col items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue via-brand-violet to-brand-cyan shadow-[0_0_60px_-8px_rgba(139,92,246,0.7)]"
              >
                <Sparkles size={36} className="text-white" />
                <span className="absolute inset-0 animate-ping rounded-full bg-brand-violet/30" />
              </motion.div>
              <p className="text-sm font-medium text-slate-300">
                {status === 'completed' ? 'Interview complete' : respond.isPending ? 'Thinking...' : 'Listening...'}
              </p>
            </div>

            <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 font-mono text-xs text-slate-200 backdrop-blur">
              <Clock size={13} /> {mm}:{ss}
            </div>
            {screenSharing && (
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-brand-cyan/20 px-3 py-1.5 text-xs text-brand-cyan backdrop-blur">
                <MonitorUp size={13} /> Sharing screen
              </div>
            )}

            <div className="absolute bottom-4 right-4 h-32 w-44 overflow-hidden rounded-xl2 border border-white/15 bg-black/60 shadow-lg">
              {camOn ? (
                <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-600">
                  <VideoOff size={22} />
                </div>
              )}
            </div>

            {status === 'in_progress' && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3">
                <button
                  onClick={() => setMicOn((v) => !v)}
                  aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
                  className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur transition-colors ${micOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/80 text-white'}`}
                >
                  {micOn ? <Mic size={17} /> : <MicOff size={17} />}
                </button>
                <button
                  onClick={() => setCamOn((v) => !v)}
                  aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}
                  className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur transition-colors ${camOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/10 text-slate-400 hover:bg-white/20'}`}
                >
                  {camOn ? <Video size={17} /> : <VideoOff size={17} />}
                </button>
                <button
                  onClick={toggleScreenShare}
                  aria-label={screenSharing ? 'Stop screen share' : 'Share your screen'}
                  className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur transition-colors ${screenSharing ? 'bg-brand-cyan/80 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <MonitorUp size={17} />
                </button>
                <button
                  onClick={handleEnd}
                  disabled={endInterview.isPending}
                  aria-label="End interview"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/90 text-white hover:bg-red-500 disabled:opacity-50"
                >
                  <PhoneOff size={17} />
                </button>
              </div>
            )}
          </GlassCard>

          {status === 'in_progress' && (
            <GlassCard hover={false} className="p-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={composerText + (speech.interimText ? ` ${speech.interimText}` : '')}
                  onChange={(e) => setComposerText(e.target.value)}
                  placeholder="Type your answer, or use the mic to speak it..."
                  rows={2}
                  className="flex-1 resize-none rounded-xl2 border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                />
                {speech.isSupported && (
                  <button
                    onClick={() => (speech.isListening ? speech.stop() : speech.start())}
                    aria-label={speech.isListening ? 'Stop dictation' : 'Start dictation'}
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      speech.isListening ? 'bg-red-500/80 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    )}
                  >
                    {speech.isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}
                <GlowButton size="sm" icon={<Send size={14} />} onClick={handleSend} disabled={respond.isPending || !composerText.trim()}>
                  Send
                </GlowButton>
              </div>
              {!speech.isSupported && (
                <p className="mt-2 text-xs text-slate-500">Voice dictation isn't supported in this browser — you can still type your answer.</p>
              )}
            </GlassCard>
          )}
        </div>

        <div className="space-y-5">
          {status === 'completed' && finalScores ? (
            <GlassCard hover={false} glow="cyan" className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">Session Complete</p>
              <div className="mt-4 space-y-3">
                <Metric label="Technical accuracy" value={finalScores.technical_score} />
                <Metric label="Communication clarity" value={finalScores.communication_score} />
                <Metric label="Confidence" value={finalScores.confidence_score} />
                <Metric label="Problem-solving" value={finalScores.problem_solving_score} />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-slate-300">{finalScores.summary}</p>
            </GlassCard>
          ) : (
            <GlassCard hover={false} className="flex h-full max-h-[600px] flex-col p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Transcript</p>
              <div className="mt-4 flex-1 space-y-3 overflow-y-auto">
                {transcript.map((line, i) => (
                  <div key={i} className={`flex ${line.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl2 px-4 py-2.5 text-sm ${line.role === 'candidate' ? 'bg-brand-violet/20 text-slate-100' : 'bg-white/5 text-slate-300'}`}>
                      {line.text}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan"
        />
      </div>
    </div>
  );
}
