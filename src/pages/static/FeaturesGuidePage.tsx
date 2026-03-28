import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';

const roles = [
  {
    role: 'Students',
    icon: 'school',
    color: 'text-primary',
    bg: 'bg-primary/10',
    features: [
      'Interest onboarding and club discovery',
      'Campus event feed with RSVP and reminders',
      'Wellbeing check-ins and self-reported pulse tracking',
      'Team and intramural participation experiences',
      'Role-aware notifications and campus announcements',
      'A platform mode tailored to university or school context',
    ],
  },
  {
    role: 'Teachers and Faculty',
    icon: 'person_book',
    color: 'text-tertiary',
    bg: 'bg-tertiary/10',
    features: [
      'Class and course shells tied to institutional roles',
      'Assignment creation and lightweight academic workflows',
      'Polls and surveys for class feedback and pulse checks',
      'Announcements to targeted student groups',
      'Visibility into connected campus engagement context',
      'Progressive path toward LMS-linked experiences',
    ],
  },
  {
    role: 'Administrators',
    icon: 'admin_panel_settings',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    features: [
      'Institution setup, member management, and announcements',
      'Club approvals and student organization workflows',
      'Venue operations and institutional communications',
      'Foundation for analytics, reporting, and retention insights',
      'Survey distribution and policy-safe audience targeting',
      'Multi-platform support across university, school, and preschool',
    ],
  },
  {
    role: 'Parents and Guardians',
    icon: 'family_restroom',
    color: 'text-purple-600',
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    features: [
      'Child linking and parent-facing communication',
      'Daily reports for preschool and early years settings',
      'Announcements relevant to their institution or child context',
      'Progressive support for school-family coordination',
      'Fast, low-friction onboarding without long setup fatigue',
      'Secure, role-scoped access to family-facing information',
    ],
  },
  {
    role: 'Club Leaders and Student Reps',
    icon: 'groups',
    color: 'text-amber-600',
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    features: [
      'Create and operate clubs inside a single workspace',
      'Publish student-facing events and announcements',
      'Review or support club approval workflows',
      'Request and track venue bookings',
      'Manage members and engagement activities',
      'Operate against real institution data rather than demos',
    ],
  },
  {
    role: 'Coaches',
    icon: 'sports',
    color: 'text-orange-600',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    features: [
      'Team creation and training schedule workflows',
      'Sports participation foundations for P1 expansion',
      'Game and training records tied to live data',
      'Operational pathway toward full intramural management',
      'Coach-facing communications and future survey support',
      'Preparation for standings, live scores, and compliance reporting',
    ],
  },
  {
    role: 'IT Directors',
    icon: 'developer_mode',
    color: 'text-slate-600',
    bg: 'bg-slate-100 dark:bg-slate-700/30',
    features: [
      'User directory and role visibility by institution',
      'API key issuance and revocation',
      'Public-safe API documentation review and full logged-in reference',
      'Audit log visibility for integration and governance activity',
      'Integration review surfaces for LMS, SSO, and webhook planning',
      'Foundation for institutional API and identity rollout',
    ],
  },
];

export default function FeaturesGuidePage() {
  return (
    <div className="bg-background dark:bg-slate-950 min-h-screen">
      <PublicNav />
      <main className="pt-28">
        <section className="max-w-7xl mx-auto px-8 py-16 text-center">
          <span className="font-label font-bold text-xs uppercase text-secondary tracking-widest">Features Guide</span>
          <h1 className="font-headline font-extrabold text-5xl lg:text-6xl text-on-surface dark:text-slate-50 tracking-tight mt-4 mb-6">
            Built for Every<br /><span className="text-primary">Role on Campus</span>.
          </h1>
          <p className="text-xl text-on-surface-variant dark:text-slate-400 max-w-2xl mx-auto">
            Campus Tribe is a unified multi-platform system where every stakeholder has a role-aware experience across university, school, and preschool modes.
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-8 py-8 pb-24">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {roles.map(r => (
              <div key={r.role} className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl p-8 border border-outline-variant/20 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 rounded-full ${r.bg} flex items-center justify-center mb-5`}>
                  <span className={`material-symbols-outlined text-2xl ${r.color}`}>{r.icon}</span>
                </div>
                <h3 className="font-headline font-bold text-xl text-on-surface dark:text-slate-100 mb-4">{r.role}</h3>
                <ul className="space-y-3">
                  {r.features.map(f => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-sm text-tertiary mt-0.5 shrink-0">check_circle</span>
                      <span className="text-sm text-on-surface-variant dark:text-slate-400 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
