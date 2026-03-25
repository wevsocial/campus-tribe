import { Link } from 'react-router-dom';
import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';

const jobs = [
  { title: 'Senior Full-Stack Engineer', team: 'Engineering', location: 'Remote / Toronto', type: 'Full-time', tags: ['React', 'Node.js', 'Supabase'] },
  { title: 'Product Designer (UX/UI)', team: 'Design', location: 'Remote', type: 'Full-time', tags: ['Figma', 'Design Systems', 'Research'] },
  { title: 'Campus Success Manager', team: 'Customer Success', location: 'Toronto, ON', type: 'Full-time', tags: ['EdTech', 'Onboarding', 'Account Management'] },
  { title: 'Growth Marketing Manager', team: 'Marketing', location: 'Remote / Toronto', type: 'Full-time', tags: ['B2B SaaS', 'SEO', 'Content'] },
  { title: 'Data Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time', tags: ['PostgreSQL', 'dbt', 'Analytics'] },
];

const benefits = [
  { icon: 'health_and_safety', title: 'Full Health Benefits', desc: 'Medical, dental, and vision for you and your family.' },
  { icon: 'school', title: 'Learning Budget', desc: '$2,000/year for courses, conferences, and books.' },
  { icon: 'beach_access', title: 'Unlimited PTO', desc: 'We trust you to rest and recharge when you need it.' },
  { icon: 'home_work', title: 'Remote-First', desc: 'Work from anywhere - we have async-first culture.' },
  { icon: 'trending_up', title: 'Equity Package', desc: 'Options for all full-time employees from day one.' },
  { icon: 'groups', title: 'Team Retreats', desc: 'Annual all-hands in-person retreat + quarterly team offsites.' },
];

export default function CareersPage() {
  return (
    <div className="bg-background dark:bg-slate-950 min-h-screen">
      <PublicNav />
      <main className="pt-28">
        <section className="max-w-7xl mx-auto px-8 py-16 text-center">
          <span className="font-label font-bold text-xs uppercase text-secondary tracking-widest">Join Us</span>
          <h1 className="font-headline font-extrabold text-5xl lg:text-7xl text-on-surface dark:text-slate-50 tracking-tight mt-4 mb-6">
            Build the Future<br />of <span className="text-primary">Campus Life</span>.
          </h1>
          <p className="text-xl text-on-surface-variant dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            We are a mission-driven team making students feel connected, supported, and seen. Come work on problems that genuinely matter.
          </p>
        </section>

        {/* Culture */}
        <section className="bg-surface-container-low dark:bg-slate-900 py-20">
          <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-headline font-bold text-4xl text-on-surface dark:text-slate-100 mb-6">Our Culture</h2>
              <p className="text-on-surface-variant dark:text-slate-400 text-lg leading-relaxed mb-4">
                We move fast without breaking people. We care deeply about our product and the students it serves. We debate ideas vigorously and execute with precision.
              </p>
              <p className="text-on-surface-variant dark:text-slate-400 text-lg leading-relaxed">
                At Campus Tribe, you will work with some of the most talented EdTech engineers, designers, and operators in the industry - all united by a shared belief that connection is foundational to human flourishing.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {benefits.map(b => (
                <div key={b.title} className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-xl shadow-sm">
                  <span className="material-symbols-outlined text-primary text-2xl mb-3 block">{b.icon}</span>
                  <h4 className="font-headline font-bold text-sm dark:text-slate-100 mb-1">{b.title}</h4>
                  <p className="text-xs text-on-surface-variant dark:text-slate-400">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Jobs */}
        <section className="max-w-7xl mx-auto px-8 py-20">
          <h2 className="font-headline font-bold text-4xl text-on-surface dark:text-slate-100 mb-10">Open Positions</h2>
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.title} className="bg-surface-container-lowest dark:bg-slate-800 p-6 rounded-xl border border-outline-variant/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-headline font-bold text-xl dark:text-slate-100">{job.title}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{job.team}</span>
                    <span className="text-xs bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">{job.location}</span>
                    <span className="text-xs bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">{job.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase">{tag}</span>
                    ))}
                  </div>
                </div>
                <Link to="/register" className="bg-primary text-white font-headline font-bold px-6 py-3 rounded-full hover:bg-primary-dim transition-colors whitespace-nowrap">Apply Now</Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
