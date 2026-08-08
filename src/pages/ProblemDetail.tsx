import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Lightbulb, Sparkles, CheckCircle2, XCircle, ChevronDown, Bookmark, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { Skeleton } from '../components/ui/Skeleton';
import { useProblem } from '../hooks/useProblems';
import { useSubmissions, useSubmitCode, type JudgeResult } from '../hooks/useSubmissions';
import { useBookmarks, useToggleBookmark } from '../hooks/useBookmarks';
import { useAuth } from '../contexts/AuthContext';
import { useClickOutside } from '../hooks/useClickOutside';
import { cn } from '../lib/utils';
import { useRef } from 'react';

const languages = ['javascript', 'python'] as const;
const languageLabel: Record<string, string> = { javascript: 'JavaScript', python: 'Python' };

const verdictColor: Record<string, string> = {
  Accepted: 'text-green-400 bg-green-400/10',
  'Wrong Answer': 'text-red-400 bg-red-400/10',
  'Time Limit Exceeded': 'text-yellow-400 bg-yellow-400/10',
  'Memory Limit Exceeded': 'text-yellow-400 bg-yellow-400/10',
  'Compilation Error': 'text-orange-400 bg-orange-400/10',
  'Runtime Error': 'text-orange-400 bg-orange-400/10',
  'Presentation Error': 'text-yellow-400 bg-yellow-400/10',
};

const difficultyColor: Record<string, string> = {
  Easy: 'text-green-400 bg-green-400/10',
  Medium: 'text-yellow-400 bg-yellow-400/10',
  Hard: 'text-red-400 bg-red-400/10',
};

export default function ProblemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { data, isLoading, isError } = useProblem(slug);
  const [language, setLanguage] = useState<(typeof languages)[number]>('javascript');
  const [langOpen, setLangOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>({});
  const [result, setResult] = useState<JudgeResult | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, () => setLangOpen(false), langOpen);

  const problemId = data?.problem.id;
  const submitCode = useSubmitCode(problemId ?? '', user?.id);
  const { data: submissions } = useSubmissions(user?.id, problemId);
  const { data: bookmarks } = useBookmarks(user?.id);
  const isBookmarked = Boolean(bookmarks?.some((b: any) => b.problem_id === problemId));
  const toggleBookmark = useToggleBookmark(user?.id, problemId ?? '');

  useEffect(() => {
    setResult(null);
    setShowHint(false);
  }, [slug]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !data) {
    return (
      <DashboardLayout>
        <GlassCard hover={false} className="flex flex-col items-center gap-3 p-10 text-center">
          <AlertTriangle size={28} className="text-yellow-400" />
          <p className="text-sm text-slate-400">Couldn't find that problem, or it hasn't been seeded yet.</p>
        </GlassCard>
      </DashboardLayout>
    );
  }

  const { problem, examples } = data;
  const code = codeByLanguage[language] ?? problem.starter_code[language] ?? `// No starter code seeded for ${language} yet — write your solution from scratch.`;

  async function handleRun() {
    setResult(null);
    try {
      const res = await submitCode.mutateAsync({ language, code });
      setResult(res);
    } catch {
      // surfaced via submitCode.isError below
    }
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 gap-5 lg:h-[calc(100vh-4rem)] lg:grid-cols-2">
        <GlassCard hover={false} className="flex max-h-[80vh] flex-col overflow-hidden p-0 lg:max-h-none">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-white">{problem.title}</h2>
              <span className={cn('mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs', difficultyColor[problem.difficulty])}>{problem.difficulty}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleBookmark.mutate(isBookmarked)}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this problem'}
                aria-pressed={isBookmarked}
                className={cn('rounded-full border border-white/10 p-2 hover:border-brand-cyan/50', isBookmarked ? 'text-brand-cyan' : 'text-slate-400')}
              >
                <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={() => setShowHint((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-brand-cyan/50 hover:text-brand-cyan"
              >
                <Lightbulb size={13} /> Hint
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{problem.description}</p>
            {problem.constraints && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Constraints</p>
                <p className="mt-1 whitespace-pre-line font-mono text-xs text-slate-400">{problem.constraints}</p>
              </div>
            )}

            {showHint && (
              <div className="mt-4 flex items-start gap-3 rounded-xl2 border border-brand-cyan/20 bg-brand-cyan/5 p-4">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-brand-cyan" />
                <p className="text-sm text-slate-300">
                  Think about which topics this problem is tagged with ({problem.topics.join(', ')}) — that's usually
                  the shape of the intended approach. This app doesn't auto-reveal solutions.
                </p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {examples.map((ex) => (
                <div key={ex.id} className="rounded-xl2 bg-white/5 p-4">
                  <p className="font-mono text-xs text-slate-500">Example {ex.order_index}:</p>
                  <p className="mt-1 font-mono text-xs text-slate-300">Input: {ex.input}</p>
                  <p className="font-mono text-xs text-slate-300">Output: {ex.output}</p>
                  {ex.explanation && <p className="mt-1 text-xs text-slate-500">{ex.explanation}</p>}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {problem.topics.map((t) => (
                <span key={t} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-400">{t}</span>
              ))}
            </div>

            {submissions && submissions.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your Submissions</p>
                <div className="mt-3 space-y-2">
                  {submissions.slice(0, 5).map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-xl2 bg-white/5 px-4 py-2.5 text-xs">
                      <span className={cn('rounded-full px-2 py-0.5', verdictColor[s.verdict])}>{s.verdict}</span>
                      <span className="text-slate-500">{languageLabel[s.language] ?? s.language} · {new Date(s.submitted_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        <div className="flex flex-col gap-5">
          <GlassCard hover={false} className="flex flex-1 flex-col overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setLangOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={langOpen}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-200 hover:bg-white/5"
                >
                  {languageLabel[language]}
                  <ChevronDown size={14} className={cn('transition-transform', langOpen && 'rotate-180')} />
                </button>
                {langOpen && (
                  <div role="listbox" className="glass absolute left-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-xl2 p-1">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        role="option"
                        aria-selected={lang === language}
                        onClick={() => {
                          setLanguage(lang);
                          setLangOpen(false);
                        }}
                        className={cn('block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10', lang === language && 'text-brand-cyan')}
                      >
                        {languageLabel[lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <GlowButton size="sm" icon={<Play size={13} />} onClick={handleRun} disabled={submitCode.isPending}>
                {submitCode.isPending ? 'Judging...' : 'Submit'}
              </GlowButton>
            </div>

            <div className="h-[420px] lg:h-auto lg:min-h-[280px] lg:flex-1">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={(value) => setCodeByLanguage((prev) => ({ ...prev, [language]: value ?? '' }))}
                options={{ fontSize: 13, minimap: { enabled: false }, fontFamily: "'JetBrains Mono', monospace", padding: { top: 16 }, scrollBeyondLastLine: false }}
              />
            </div>
          </GlassCard>

          <GlassCard hover={false} className="max-h-56 overflow-y-auto p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Judge Result</p>

            {submitCode.isError && (
              <p className="text-xs text-red-400">{submitCode.error instanceof Error ? submitCode.error.message : 'The judge failed to run your submission.'}</p>
            )}

            {!result && !submitCode.isError && (
              <p className="text-xs text-slate-500">Submit your code to run it against the real test suite.</p>
            )}

            {result && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  {result.verdict === 'Accepted' ? <CheckCircle2 size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}
                  <span className={cn('rounded-full px-2.5 py-1 font-medium', verdictColor[result.verdict])}>{result.verdict}</span>
                  <span className="text-slate-500">{result.passed_count}/{result.total_count} test cases passed · {result.runtime_ms}ms</span>
                </div>

                {result.failed_testcase && (
                  <div className="rounded-xl2 bg-white/5 p-3 font-mono">
                    <p className="text-slate-500">Failed test case (visible):</p>
                    <p className="mt-1 text-slate-300">Input: {result.failed_testcase.input}</p>
                    <p className="text-slate-300">Expected: {result.failed_testcase.expected}</p>
                    <p className="text-red-300">Your output: {result.failed_testcase.actual || '(empty)'}</p>
                  </div>
                )}

                {result.failed_on_hidden_case && (
                  <p className="text-slate-500">Failed on a hidden test case — its input and expected output aren't shown, to keep the test suite meaningful.</p>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
