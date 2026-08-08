import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sidebarLinks } from '../../data/content';
import { cn } from '../../lib/utils';

/**
 * Sidebar is `hidden lg:flex`, which previously left every dashboard-area
 * page (Dashboard, Playground, AI Interview, Leaderboard, Profile, Settings)
 * with zero navigation on mobile and tablet. This renders the same links as
 * a fixed bottom tab bar below the lg breakpoint.
 */
export function MobileTabBar() {
  return (
    <nav
      aria-label="Primary"
      className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-2xl px-2 py-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] lg:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {sidebarLinks.map((link) => (
        <NavLink key={link.to} to={link.to} end aria-label={link.label} className="relative flex-1">
          {({ isActive }) => (
            <div
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors',
                isActive ? 'text-brand-cyan' : 'text-slate-400'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-tab-active"
                  className="absolute inset-0 rounded-xl bg-white/8"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <link.icon size={19} className="relative z-10" />
              <span className="relative z-10 truncate">{link.label.split(' ')[0]}</span>
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
