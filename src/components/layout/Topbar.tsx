import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Search, Flame, BellOff } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useAuth } from '../../contexts/AuthContext';

function initialsFor(name: string, email: string | undefined) {
  const source = name.trim() || email || '';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function Topbar({ title, subtitle, streakDays }: { title: string; subtitle?: string; streakDays?: number }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  useClickOutside(notifRef, () => setNotifOpen(false), notifOpen);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/problems?search=${encodeURIComponent(searchValue.trim())}`);
    }
  }

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search problems..."
            aria-label="Search problems"
            className="glass w-56 rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 lg:w-72"
          />
        </div>

        {typeof streakDays === 'number' && (
          <div className="glass flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-orange-300">
            <Flame size={16} />
            <span className="font-semibold">{streakDays}</span>
          </div>
        )}

        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="glass flex h-10 w-10 items-center justify-center rounded-full text-slate-300 hover:text-white"
          >
            <Bell size={17} />
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="glass absolute right-0 top-full z-20 mt-2 w-72 overflow-hidden rounded-xl2 p-4"
              >
                <p className="text-sm font-semibold text-white">Notifications</p>
                <div className="mt-4 flex flex-col items-center gap-2 py-6 text-center">
                  <BellOff size={22} className="text-slate-600" />
                  <p className="text-xs text-slate-500">You're all caught up. No new notifications.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue to-brand-violet text-xs font-semibold text-white ring-2 ring-white/10"
          aria-label={profile?.full_name || 'Account'}
        >
          {initialsFor(profile?.full_name ?? '', user?.email)}
        </div>
      </div>
    </div>
  );
}
