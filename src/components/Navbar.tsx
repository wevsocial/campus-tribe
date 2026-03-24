import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import clsx from 'clsx'

const navLinks = [
  { label: 'University', href: '#university' },
  { label: 'School', href: '#school' },
  { label: 'Preschool', href: '#preschool' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '#resources' },
  { label: 'About', href: '#about' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  return (
    <nav className="sticky top-0 z-50 bg-surface-lowest/95 backdrop-blur border-b border-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center">
            <span className="text-white font-headline font-900 text-sm">CT</span>
          </div>
          <span className="font-headline font-800 text-on-surface text-lg">Campus Tribe</span>
        </Link>

        {!isDashboard && (
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <a key={link.label} href={link.href}
                className="text-on-surface-variant hover:text-primary text-sm font-label font-bold transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-on-surface-variant hover:text-primary text-sm font-label font-bold transition-colors">
            Login
          </Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-surface-lowest border-t border-surface px-4 py-4 flex flex-col gap-4">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} onClick={() => setOpen(false)}
              className="text-on-surface-variant text-sm font-label font-bold">
              {link.label}
            </a>
          ))}
          <Link to="/login" className="text-primary text-sm font-label font-bold">Login</Link>
          <Link to="/register" className="btn-primary text-center">Get Started</Link>
        </div>
      )}
    </nav>
  )
}
