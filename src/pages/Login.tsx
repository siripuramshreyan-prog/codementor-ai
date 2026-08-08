import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { AuroraBackground } from '../components/ui/AuroraBackground';
import { FloatingOrb } from '../components/ui/FloatingOrb';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setFormError(null);
    const { error } = await signIn(values.email, values.password);
    setSubmitting(false);
    if (error) {
      setFormError(error);
      return;
    }
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';
    navigate(redirectTo, { replace: true });
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setFormError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setFormError(error.message);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <AuroraBackground />
      <FloatingOrb size={100} color="blue" className="left-[10%] top-[15%]" />
      <FloatingOrb size={80} color="cyan" className="right-[12%] bottom-[18%]" delay="-3s" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl2 bg-gradient-to-br from-brand-blue to-brand-violet shadow-[0_0_20px_-4px_rgba(139,92,246,0.7)]">
            <Sparkles size={17} className="text-white" />
          </div>
          <span className="text-[16px] font-semibold text-white">
            CodeMentor <span className="text-gradient">AI</span>
          </span>
        </Link>

        <GlassCard hover={false} className="p-8 sm:p-10">
          <h1 className="text-center text-2xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-center text-sm text-slate-400">Log in to continue your progress.</p>

          <div className="mt-7 flex gap-3">
            <button type="button" onClick={() => handleOAuth('google')} className="glass flex flex-1 items-center justify-center gap-2 rounded-xl2 py-2.5 text-sm text-slate-200 transition-colors hover:bg-white/10">
              <GoogleIcon /> Google
            </button>
            <button type="button" onClick={() => handleOAuth('github')} className="glass flex flex-1 items-center justify-center gap-2 rounded-xl2 py-2.5 text-sm text-slate-200 transition-colors hover:bg-white/10">
              <GithubIcon /> GitHub
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500">or continue with email</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {formError && (
            <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl2 border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-400">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className="w-full rounded-xl2 border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium text-slate-400">
                  Password
                </label>
                <button type="button" onClick={(e) => e.preventDefault()} className="text-xs text-brand-cyan hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className="w-full rounded-xl2 border border-white/10 bg-white/5 py-2.5 pl-10 pr-11 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <GlowButton type="submit" className="w-full" size="md" icon={submitting ? undefined : <ArrowRight size={16} />} disabled={submitting}>
              {submitting ? 'Logging in...' : 'Log In'}
            </GlowButton>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-cyan hover:underline">
              Sign up
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.42.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
    </svg>
  );
}
