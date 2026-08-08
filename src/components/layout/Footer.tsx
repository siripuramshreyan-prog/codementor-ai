import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle } from 'lucide-react';

const columns = [
  { title: 'Company', links: ['About', 'Careers', 'Blog', 'Press'] },
  { title: 'Product', links: ['Playground', 'AI Interviews', 'Roadmap', 'Pricing'] },
  { title: 'Resources', links: ['Docs', 'Community', 'Support', 'Changelog'] },
];

function GithubGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.4-5.25 5.68.42.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
    </svg>
  );
}

function LinkedinGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-brand-navy/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl2 bg-gradient-to-br from-brand-blue to-brand-violet">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-[15px] font-semibold text-white">
                CodeMentor <span className="text-gradient">AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              Practice coding, prepare for interviews, and become job ready — with AI in your corner the whole way.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-all hover:-translate-y-0.5 hover:border-brand-cyan/50 hover:text-brand-cyan">
                <GithubGlyph />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-all hover:-translate-y-0.5 hover:border-brand-cyan/50 hover:text-brand-cyan">
                <LinkedinGlyph />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="Discord" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 transition-all hover:-translate-y-0.5 hover:border-brand-cyan/50 hover:text-brand-cyan">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-slate-400 transition-colors hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} CodeMentor AI. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-300">Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-300">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
