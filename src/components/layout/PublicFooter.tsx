import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import WevSocialBadge from '../ui/WevSocialBadge';
import CampusTribeLogo from '../ui/CampusTribeLogo';

export default function PublicFooter() {
  return (
    <footer className="bg-surface-container-low dark:bg-slate-950 w-full py-12 px-4 md:px-8 lg:px-12 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <CampusTribeLogo className="w-8 h-8" />
              <span className="font-headline font-bold text-xl text-primary dark:text-blue-200">Campus<span className="text-orange-500">Tribe</span></span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              The world's first student engagement platform designed for modern institutional connection.<br /><br /><WevSocialBadge />
            </p>
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-surface dark:text-slate-100 mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/resources/features" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Features</Link></li>
              <li><Link to="/pricing" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Pricing</Link></li>
              <li><Link to="/demo" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Demo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-surface dark:text-slate-100 mb-6">Ecosystem</h4>
            <ul className="space-y-4">
              <li><Link to="/university" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">University Portal</Link></li>
              <li><Link to="/school" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">School Network</Link></li>
              <li><Link to="/preschool" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Early Years Care</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-surface dark:text-slate-100 mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><Link to="/resources/features" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Features Guide</Link></li>
              <li><Link to="/resources/wellbeing" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Wellbeing Whitepaper</Link></li>
              <li><Link to="/resources/api-documentation" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">API Documentation</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-surface dark:text-slate-100 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">About Us</Link></li>
              <li><Link to="/careers" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Careers</Link></li>
              <li><Link to="/blog" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Blog</Link></li>
              <li><Link to="/newsletter" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Newsletter</Link></li>
              <li><Link to="/resources/support" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-outline-variant/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">&copy; 2026 WevSocial Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="flex gap-6 text-sm text-slate-400">
              <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-secondary transition-colors">Terms</Link>
            </div>
            <div className="flex gap-3">
              <a href="https://linkedin.com/company/wevsocial" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-primary hover:text-white text-slate-400 transition-colors">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://twitter.com/wevsocial" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-primary hover:text-white text-slate-400 transition-colors">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://instagram.com/wevsocial" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-primary hover:text-white text-slate-400 transition-colors">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
