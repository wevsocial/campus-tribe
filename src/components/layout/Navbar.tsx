import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { Menu, X, ChevronDown } from 'lucide-react';
import CampusTribeLogo from '../ui/CampusTribeLogo';

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <CampusTribeLogo className="w-9 h-9" animated={true} showText={true} />
          <span className="text-xs font-jakarta font-700 text-white bg-secondary px-2 py-0.5 rounded-full hidden sm:inline">by WevSocial</span>
        </Link>

        {!isDashboard && (
          <>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {[
                { label: 'University', href: '/#university' },
                { label: 'School', href: '/#school' },
                { label: 'Preschool', href: '/#preschool' },
                { label: 'Pricing', href: '/pricing' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-sm font-jakarta text-on-surface-variant hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <button className="flex items-center gap-1 text-sm font-jakarta text-on-surface-variant hover:text-primary transition-colors">
                Resources <ChevronDown size={14} />
              </button>
              <button className="flex items-center gap-1 text-sm font-jakarta text-on-surface-variant hover:text-primary transition-colors">
                About <ChevronDown size={14} />
              </button>
            </nav>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-jakarta font-700 text-on-surface-variant hover:text-primary transition-colors px-3 py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-jakarta font-700 text-white bg-primary hover:bg-primary-dim transition-colors px-4 py-2 rounded-full"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-on-surface-variant"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </>
        )}

        {isDashboard && (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-jakarta text-on-surface-variant hover:text-primary">
              Sign Out
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {menuOpen && !isDashboard && (
        <div className="md:hidden bg-white border-t border-outline-variant/30 px-4 py-4 flex flex-col gap-3">
          {['University', 'School', 'Preschool', 'Pricing', 'Resources', 'About'].map((item) => (
            <Link
              key={item}
              to={item === 'Pricing' ? '/pricing' : `/#${item.toLowerCase()}`}
              className="text-sm font-jakarta text-on-surface-variant hover:text-primary py-1"
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <hr className="border-outline-variant/30" />
          <Link to="/login" className="text-sm font-jakarta font-700 text-primary" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/register" className="text-sm font-jakarta font-700 text-white bg-primary px-4 py-2 rounded-full text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
