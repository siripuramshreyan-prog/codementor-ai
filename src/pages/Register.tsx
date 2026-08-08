import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, AtSign, Sparkles, ArrowRight, Check, AlertCircle, MailCheck } from 'lucide-react';
import { AuroraBackground } from '../components/ui/AuroraBackground';
import { FloatingOrb } from '../components/ui/FloatingOrb';
import { GlassCard } from '../components/ui/GlassCard';
import { GlowButton } from '../components/ui/GlowButton';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    username: z
      .string()
      .min(3, 'At least 3 characters')
      .max(24, 'At most 24 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-brand-cyan', 'bg-green-500'];

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const strength = useMemo(() => getStrength(password), [password]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setFormError(null);
    const { error, needsEmailConfirmation } = await signUp(values.email, values.password, values.username, values.name);
    setSubmitting(false);

    if (error) {
      setFormError(error);
      return;
    }
    if (needsEmailConfirmation) {
      setAwaitingConfirmation(true);
      return;
    }
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <AuroraBackground />
      <FloatingOrb size={100} color="violet" className="right-[10%] top-[15%]" />
      <FloatingOrb size={80} color="blue" className="left-[12%] bottom-[18%]" delay="-3s" />

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
          {awaitingConfirmation ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-cyan/10 text-brand-cyan">
                <MailCheck size={22} />
              </div>
              <h1 className="mt-4 text-xl font-semibold text-white">Check your email</h1>
              <p className="mt-2 text-sm text-slate-400">
                We sent a confirmation link to your inbox. Click it to activate your account, then log in.
              </p>
              <Link to="/login" className="mt-6 inline-block">
                <GlowButton size="sm">Go to Log In</GlowButton>
              </Link>
            </div>
          ) : (
            <>
          <h1 className="text-center text-2xl font-semibold text-white">Create your account</h1>
          <p className="mt-2 text-center text-sm text-slate-400">Start practicing in under a minute.</p>

          {formError && (
            <div role="alert" className="mt-6 flex items-start gap-2 rounded-xl2 border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-slate-400">
                Full name
              </label>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="name"
                  placeholder="Your full name"
                  {...register('name')}
                  className="w-full rounded-xl2 border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-medium text-slate-400">
                Username
              </label>
              <div className="relative">
                <AtSign size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="username"
                  placeholder="yourusername"
                  {...register('username')}
                  className="w-full rounded-xl2 border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                />
              </div>
              {errors.username && <p className="mt-1.5 text-xs text-red-400">{errors.username.message}</p>}
            </div>

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
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { onChange: (e) => setPassword(e.target.value) })}
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
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full bg-white/10 transition-colors duration-300',
                          i < strength && strengthColors[strength]
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">{strengthLabels[strength]}</p>
                </div>
              )}
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-slate-400">
                Confirm password
              </label>
              <div className="relative">
                <Check size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="w-full rounded-xl2 border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <GlowButton type="submit" className="w-full" size="md" icon={submitting ? undefined : <ArrowRight size={16} />} disabled={submitting}>
              {submitting ? 'Creating account...' : 'Create Account'}
            </GlowButton>
          </form>

          <p className="mt-7 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-cyan hover:underline">
              Log in
            </Link>
          </p>
            </>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
