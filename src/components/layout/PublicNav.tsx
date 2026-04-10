import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import CampusTribeLogo from '../ui/CampusTribeLogo';

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggle } = useTheme();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-8 h-20 max-w-full mx-auto">
        <Link to="/" className="flex items-center gap-2.5 group">
          <CampusTribeLogo className="w-9 h-9 transition-transform group-hover:scale-105" animated={true} showText={true} />
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <Link to="/university" className="text-slate-600 dark:text-slate-300 hover:text-primary font-headline tracking-tight font-medium transition-colors duration-200">University</Link>
          <Link to="/school" className="text-slate-600 dark:text-slate-300 hover:text-primary font-headline tracking-tight font-medium transition-colors duration-200">School</Link>
          <Link to="/preschool" className="text-slate-600 dark:text-slate-300 hover:text-primary font-headline tracking-tight font-medium transition-colors duration-200">Preschool</Link>
          <Link to="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-primary font-headline tracking-tight font-medium transition-colors duration-200">Pricing</Link>
          <div className="relative group">
            <button className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-primary font-headline tracking-tight font-medium transition-colors duration-200">
              Resources <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block pt-2 z-50">
              <div className="bg-white dark:bg-zinc-800 shadow-xl rounded-xl border border-slate-100 dark:border-zinc-700 p-2 min-w-[220px]">
                <Link to="/resources/features" className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-lg text-sm transition-colors dark:text-slate-200">Features Guide</Link>
                <Link to="/resources/api-documentation" className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-lg text-sm transition-colors dark:text-slate-200">API Documentation</Link>
                <Link to="/resources/wellbeing" className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-lg text-sm transition-colors dark:text-slate-200">Wellbeing Whitepaper</Link>
              </div>
            </div>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-primary font-headline tracking-tight font-medium transition-colors duration-200">
              About <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block pt-2 z-50">
              <div className="bg-white dark:bg-zinc-800 shadow-xl rounded-xl border border-slate-100 dark:border-zinc-700 p-2 min-w-[200px]">
                <Link to="/about" className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-lg text-sm transition-colors dark:text-slate-200">About Us</Link>
                <Link to="/careers" className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-lg text-sm transition-colors dark:text-slate-200">Careers</Link>
                <Link to="/blog" className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-lg text-sm transition-colors dark:text-slate-200">Blog</Link>
                <Link to="/newsletter" className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-lg text-sm transition-colors dark:text-slate-200">Newsletter</Link>
                <Link to="/resources/support" className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-lg text-sm transition-colors dark:text-slate-200">Contact Support</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button
            type="button"
            aria-label="Toggle day and night mode"
            onClick={toggle}
            className="inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-lowest dark:bg-slate-800 px-3 py-2 text-sm font-jakarta font-700 text-on-surface dark:text-slate-200 transition-colors hover:bg-surface-container-low dark:hover:bg-slate-700"
            title="Toggle day and night mode"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            <span>{dark ? 'Day' : 'Night'}</span>
          </button>
          <Link to="/login" className="hidden lg:block text-slate-600 dark:text-slate-300 font-headline font-semibold px-4 py-2 hover:bg-primary/10 rounded-full transition-all">Login</Link>
          <Link to="/register" className="bg-primary text-on-primary font-headline font-bold px-6 py-2.5 rounded-full shadow-lg shadow-primary/20 hover:scale-105 transition-transform">Get Started</Link>
        </div>
        <button type="button" className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className="material-symbols-outlined dark:text-slate-200">{mobileOpen ? 'close' : 'menu'}</span>
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 px-8 py-4 space-y-3">
          <Link to="/university" className="block py-2 text-slate-700 dark:text-slate-200 font-headline" onClick={() => setMobileOpen(false)}>University</Link>
          <Link to="/school" className="block py-2 text-slate-700 dark:text-slate-200 font-headline" onClick={() => setMobileOpen(false)}>School</Link>
          <Link to="/preschool" className="block py-2 text-slate-700 dark:text-slate-200 font-headline" onClick={() => setMobileOpen(false)}>Preschool</Link>
          <Link to="/pricing" className="block py-2 text-slate-700 dark:text-slate-200 font-headline" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link to="/resources/features" className="block py-2 text-slate-700 dark:text-slate-200 font-headline" onClick={() => setMobileOpen(false)}>Features</Link>
          <Link to="/resources/api-documentation" className="block py-2 text-slate-700 dark:text-slate-200 font-headline" onClick={() => setMobileOpen(false)}>API Documentation</Link>
          <Link to="/about" className="block py-2 text-slate-700 dark:text-slate-200 font-headline" onClick={() => setMobileOpen(false)}>About</Link>
          <Link to="/blog" className="block py-2 text-slate-700 dark:text-slate-200 font-headline" onClick={() => setMobileOpen(false)}>Blog</Link>
          <Link to="/login" className="block py-2 text-slate-700 dark:text-slate-200 font-headline" onClick={() => setMobileOpen(false)}>Login</Link>
          <Link to="/register" className="block bg-primary text-white font-headline font-bold px-6 py-3 rounded-full text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
        </div>
      )}
    </nav>
  );
}
