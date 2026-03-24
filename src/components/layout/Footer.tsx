import React from 'react';
import { Link } from 'react-router-dom';


const footerColumns = [
  {
    title: 'Platform',
    links: ['Student Portal', 'Club Management', 'Event Hub', 'Sports Leagues', 'Wellness Tracker', 'Venue Booking'],
  },
  {
    title: 'Ecosystem',
    links: ['Parent Portal', 'Smart Matching', 'Analytics', 'Surveys & Polls', 'Notifications', 'Integrations'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Reference', 'Blog', 'Case Studies', 'Status Page', 'Changelog'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Press', 'Partners', 'Contact', 'Privacy Policy'],
  },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-low border-t border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="font-lexend font-900 italic text-xl text-primary">Campus Tribe</span>
            </Link>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              The all-in-one student engagement platform for modern campuses.
            </p>
            <div className="flex items-center gap-3">
              {[
                { label: 'X', href: '#' },
                { label: 'Li', href: '#' },
                { label: 'Ig', href: '#' },
                { label: 'Gh', href: '#' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center text-xs font-jakarta font-700 text-on-surface-variant hover:bg-primary hover:text-white transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="font-lexend font-800 text-sm text-on-surface mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-on-surface-variant font-jakarta">
            WEVSOCIAL© 2026 WevSocial Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Terms', 'Privacy', 'Cookies', 'Accessibility'].map((item) => (
              <a key={item} href="#" className="text-xs text-on-surface-variant hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
