import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="bg-surface-container-low dark:bg-slate-950 w-full py-16 px-12 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="font-headline font-bold text-xl text-primary dark:text-blue-200 mb-6">Campus Tribe</div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              The world's first student engagement platform designed for modern institutional connection.<br /><br />Powered by WevSocial.
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
              <li><Link to="/resources/support" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-on-surface dark:text-slate-100 mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">About Us</Link></li>
              <li><Link to="/careers" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Careers</Link></li>
              <li><Link to="/blog" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Blog</Link></li>
              <li><Link to="/newsletter" className="text-slate-500 dark:text-slate-400 hover:text-secondary transition-all text-sm">Newsletter</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-outline-variant/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">&copy; 2026 WevSocial Inc. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-secondary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
