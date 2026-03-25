import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-8 h-20 max-w-full mx-auto">
        <Link to="/" className="text-2xl font-black text-[#0047AB] italic tracking-tighter" style={{fontFamily:'Lexend'}}>Campus Tribe</Link>
        <div className="hidden md:flex gap-8 items-center">
          <Link to="/" className="text-slate-600 hover:text-[#0047AB] font-medium transition-colors" style={{fontFamily:'Lexend'}}>University</Link>
          <Link to="/school" className="text-slate-600 hover:text-[#0047AB] font-medium transition-colors" style={{fontFamily:'Lexend'}}>School</Link>
          <Link to="/preschool" className="text-slate-600 hover:text-[#0047AB] font-medium transition-colors" style={{fontFamily:'Lexend'}}>Preschool</Link>
          <Link to="/pricing" className="text-slate-600 hover:text-[#0047AB] font-medium transition-colors" style={{fontFamily:'Lexend'}}>Pricing</Link>
          <div className="relative group">
            <button className="flex items-center gap-1 text-slate-600 hover:text-[#0047AB] font-medium" style={{fontFamily:'Lexend'}}>
              Resources <span>&#9660;</span>
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block pt-2">
              <div className="bg-white shadow-xl rounded-xl border border-slate-100 p-2 min-w-[200px]">
                <Link to="/resources/docs" className="block px-4 py-2 hover:bg-slate-50 rounded-lg text-sm">Documentation</Link>
                <Link to="/resources/webinars" className="block px-4 py-2 hover:bg-slate-50 rounded-lg text-sm">Webinars</Link>
                <Link to="/resources/case-studies" className="block px-4 py-2 hover:bg-slate-50 rounded-lg text-sm">Case Studies</Link>
              </div>
            </div>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-1 text-slate-600 hover:text-[#0047AB] font-medium" style={{fontFamily:'Lexend'}}>
              About <span>&#9660;</span>
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block pt-2">
              <div className="bg-white shadow-xl rounded-xl border border-slate-100 p-2 min-w-[200px]">
                <Link to="/about" className="block px-4 py-2 hover:bg-slate-50 rounded-lg text-sm">About Us</Link>
                <Link to="/careers" className="block px-4 py-2 hover:bg-slate-50 rounded-lg text-sm">Career</Link>
                <Link to="/newsletter" className="block px-4 py-2 hover:bg-slate-50 rounded-lg text-sm">Newsletter</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-slate-600 font-semibold px-4 py-2 hover:bg-[#0047AB]/10 rounded-full transition-all hidden lg:block" style={{fontFamily:'Lexend'}}>Login</Link>
          <Link to="/register" className="bg-[#0047AB] text-white font-bold px-6 py-2.5 rounded-full shadow-lg transition-transform hover:scale-105" style={{fontFamily:'Lexend'}}>Get Started</Link>
        </div>
      </div>
    </nav>
  );
}
