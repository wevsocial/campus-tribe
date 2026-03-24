import { Link } from 'react-router-dom'

const cols = {
  Platform: ['Discovery Hub', 'Club OS', 'Event Manager', 'Sports Hub', 'Venue Booking', 'Wellness'],
  Ecosystem: ['Integrations', 'API', 'Mobile App', 'LMS Connect', 'SSO / SAML'],
  Resources: ['Documentation', 'Blog', 'Webinars', 'Case Studies', 'Help Center'],
  Company: ['About', 'Careers', 'Press', 'Privacy', 'Terms'],
}

export default function Footer() {
  return (
    <footer className="bg-on-surface text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-hero-gradient flex items-center justify-center">
                <span className="text-white font-headline font-black text-sm">CT</span>
              </div>
              <span className="font-headline font-800 text-lg">Campus Tribe</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              The OS for Campus Life. Unifying students, staff, and athletics on one platform.
            </p>
          </div>
          {Object.entries(cols).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-label font-bold text-sm mb-4 text-white/80">{title}</h4>
              <ul className="flex flex-col gap-2">
                {links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© 2026 Campus Tribe. All rights reserved.</p>
          <p className="text-white/40 text-sm">Built with ❤️ for campus communities</p>
        </div>
      </div>
    </footer>
  )
}
