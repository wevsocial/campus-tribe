import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="bg-[#2d2f31] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="text-2xl font-extrabold italic text-white mb-3" style={{fontFamily:'Lexend'}}>Campus Tribe</div>
            <p className="text-sm text-slate-400 leading-relaxed">The world's first student engagement platform designed for modern institutional connection. Powered by WevSocial.</p>
          </div>
          <div>
            <div className="font-bold text-white mb-4 text-sm uppercase tracking-wider" style={{fontFamily:'Lexend'}}>Platform</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Integrations</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-white mb-4 text-sm uppercase tracking-wider" style={{fontFamily:'Lexend'}}>Ecosystem</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">University Portal</Link></li>
              <li><Link to="/school" className="hover:text-white transition-colors">School Network</Link></li>
              <li><Link to="/preschool" className="hover:text-white transition-colors">Early Years Care</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Institutional Access</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-white mb-4 text-sm uppercase tracking-wider" style={{fontFamily:'Lexend'}}>Resources</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-white transition-colors">Features Guide</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Wellbeing Whitepaper</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-bold text-white mb-4 text-sm uppercase tracking-wider" style={{fontFamily:'Lexend'}}>Company</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/newsletter" className="hover:text-white transition-colors">Newsletter</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">&copy; WEVSOCIAL 2026. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
