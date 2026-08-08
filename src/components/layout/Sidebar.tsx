import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Sparkles } from 'lucide-react';
import { sidebarLinks } from '../../data/content';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const links = sidebarLinks;

export function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate('/');
  }
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center border-r border-white/10 bg-brand-navy/70 py-6 backdrop-blur-xl lg:flex xl:w-64 xl:items-stretch xl:px-4">
      <div className="mb-8 flex items-center gap-2 px-2 xl:px-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl2 bg-gradient-to-br from-brand-blue to-brand-violet shadow-[0_0_20px_-4px_rgba(139,92,246,0.7)]">
          <Sparkles size={17} className="text-white" />
        </div>
        <span className="hidden text-[15px] font-semibold text-white xl:inline">
          CodeMentor <span className="text-gradient">AI</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end aria-label={link.label}>
            {({ isActive }) => (
              <div
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl2 px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-100'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl2 bg-white/8 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <link.icon size={19} className={cn('relative z-10 shrink-0', isActive && 'text-brand-cyan')} />
                <span className="relative z-10 hidden truncate xl:inline">{link.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        aria-label="Log Out"
        className="flex items-center gap-3 rounded-xl2 px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:text-red-400"
      >
        <LogOut size={19} className="shrink-0" />
        <span className="hidden xl:inline">Log Out</span>
      </button>
    </aside>
  );
}
