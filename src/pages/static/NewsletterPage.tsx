import { useState } from 'react';
import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';

const issues = [
  { number: 12, title: 'The March 2026 Edition', date: 'Mar 15, 2026', preview: 'Student mental health data from 50 campuses, our product roadmap preview, and the case for AI matchmaking.' },
  { number: 11, title: 'February Focus: Engagement Metrics', date: 'Feb 15, 2026', preview: 'How to measure and report student engagement to your board in 2026. Plus: new venue booking features.' },
  { number: 10, title: 'January Kickoff', date: 'Jan 20, 2026', preview: 'New year, new features. A look at what is shipping in Q1 and what our customers are saying.' },
];

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-background dark:bg-slate-950 min-h-screen">
      <PublicNav />
      <main className="pt-28">
        <section className="max-w-3xl mx-auto px-8 py-20 text-center">
          <span className="font-label font-bold text-xs uppercase text-secondary tracking-widest">Campus Dispatch</span>
          <h1 className="font-headline font-extrabold text-5xl lg:text-6xl text-on-surface dark:text-slate-50 tracking-tight mt-4 mb-6">
            Stay Ahead of<br /><span className="text-primary">Campus Innovation</span>.
          </h1>
          <p className="text-xl text-on-surface-variant dark:text-slate-400 leading-relaxed mb-10">
            A monthly digest for campus leaders. Research insights, product updates, case studies, and best practices - curated and delivered to your inbox.
          </p>
          {submitted ? (
            <div className="bg-tertiary-container dark:bg-green-900/30 p-8 rounded-2xl text-center">
              <span className="material-symbols-outlined text-5xl text-tertiary mb-4 block">check_circle</span>
              <h3 className="font-headline font-bold text-2xl text-on-surface dark:text-slate-100 mb-2">You are in!</h3>
              <p className="text-on-surface-variant dark:text-slate-400">Welcome to Campus Dispatch. Check your inbox for the welcome email.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your institutional email"
                className="flex-1 px-6 py-4 rounded-full border border-outline-variant dark:border-slate-600 bg-surface-container-lowest dark:bg-slate-800 font-body text-on-surface dark:text-slate-100 focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => { if (email) setSubmitted(true); }}
                className="bg-primary text-on-primary font-headline font-bold px-8 py-4 rounded-full hover:bg-primary-dim transition-colors whitespace-nowrap"
              >
                Subscribe Free
              </button>
            </div>
          )}
          <p className="text-sm text-on-surface-variant dark:text-slate-500 mt-4">No spam. Unsubscribe anytime. 2,400+ campus leaders already subscribed.</p>
        </section>

        {/* Benefits */}
        <section className="bg-surface-container-low dark:bg-slate-900 py-16">
          <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: 'schedule', title: 'Monthly Cadence', desc: 'One email per month. Curated and compact - never filler.' },
              { icon: 'insights', title: 'Data-First', desc: 'Real stats from real campuses. No vendor fluff.' },
              { icon: 'lock', title: 'No Spam', desc: 'Your email is never shared. Unsubscribe with one click.' },
            ].map(f => (
              <div key={f.title} className="bg-surface-container-lowest dark:bg-slate-800 p-8 rounded-2xl shadow-sm">
                <span className="material-symbols-outlined text-4xl text-primary mb-4 block">{f.icon}</span>
                <h3 className="font-headline font-bold text-xl dark:text-slate-100 mb-2">{f.title}</h3>
                <p className="text-on-surface-variant dark:text-slate-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Issues */}
        <section className="max-w-7xl mx-auto px-8 py-20">
          <h2 className="font-headline font-bold text-4xl text-on-surface dark:text-slate-100 mb-8">Recent Issues</h2>
          <div className="space-y-4">
            {issues.map(issue => (
              <div key={issue.number} className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-2xl border border-outline-variant/20 hover:shadow-lg transition-all flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-headline font-black text-primary">#{issue.number}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-headline font-bold text-lg dark:text-slate-100">{issue.title}</h3>
                  <p className="text-sm text-on-surface-variant dark:text-slate-400 mt-1">{issue.preview}</p>
                </div>
                <span className="text-sm text-on-surface-variant dark:text-slate-500 whitespace-nowrap">{issue.date}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
