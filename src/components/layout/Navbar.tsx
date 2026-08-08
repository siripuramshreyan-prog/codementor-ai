import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Sparkles, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { navLinks } from '../../data/content';
import { GlowButton } from '../ui/GlowButton';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useClickOutside } from '../../hooks/useClickOutside';

function initialsFor(name: string, email: string | undefined) {
  const source = name.trim() || email || '';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const onLanding = location.pathname === '/';
  const { user, profile, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(userMenuRef, () => setUserMenuOpen(false), userMenuOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function handleNavClick(href: string) {
    setOpen(false);
    if (onLanding) {
      // Give the mobile menu's collapse animation a moment to finish before
      // scrolling, so the two animations don't visually fight each other.
      window.setTimeout(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    } else {
      navigate('/' + href);
    }
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'py-3' : 'py-5'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'flex items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5',
            scrolled ? 'glass shadow-[0_8px_32px_-12px_rgba(0,0,0,0.6)]' : 'bg-transparent'
          )}
        >
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl2 bg-gradient-to-br from-brand-blue to-brand-violet shadow-[0_0_20px_-4px_rgba(139,92,246,0.7)] transition-transform duration-300 group-hover:scale-105">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">
              CodeMentor <span className="text-gradient">AI</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={onLanding ? link.href : '/' + link.href}
                onClick={(e) => {
                  if (!onLanding) return;
                  e.preventDefault();
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-full px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-slate-200 hover:bg-white/5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-violet text-xs font-semibold text-white">
                    {initialsFor(profile?.full_name ?? '', user.email)}
                  </span>
                  {profile?.full_name || profile?.username || 'Account'}
                  <ChevronDown size={14} className={cn('transition-transform', userMenuOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      role="menu"
                      className="glass absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-xl2 p-1.5"
                    >
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await signOut();
                          navigate('/');
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/10 hover:text-red-400"
                      >
                        <LogOut size={15} /> Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="rounded-full px-4 py-2 text-sm text-slate-300 transition-colors hover:text-white">
                  Log In
                </Link>
                <Link to="/register">
                  <GlowButton size="sm">Get Started</GlowButton>
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-full p-2 text-slate-200 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mx-4 mt-2 overflow-hidden rounded-2xl md:hidden"
          >
            <div className="glass flex flex-col gap-1 p-3">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </button>
              ))}
              <div className="my-1 h-px bg-white/10" />
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      setOpen(false);
                      await signOut();
                      navigate('/');
                    }}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-red-400"
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                    Log In
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="px-2 pt-1">
                    <GlowButton className="w-full" size="sm">Get Started</GlowButton>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
