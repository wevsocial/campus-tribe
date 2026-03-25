import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';

const roles = [
  {
    role: 'Students',
    icon: 'school',
    color: 'text-primary',
    bg: 'bg-primary/10',
    features: [
      'Smart peer matching by interests and study style',
      'Club discovery and one-tap membership requests',
      'Event calendar with personal RSVP tracking',
      'Intramural sports registration and leaderboards',
      'Daily wellbeing check-ins and mood tracking',
      'Venue booking for study sessions and social events',
    ],
  },
  {
    role: 'Teachers and Faculty',
    icon: 'person_book',
    color: 'text-tertiary',
    bg: 'bg-tertiary/10',
    features: [
      'Class roster with real-time attendance tracking',
      'Assignment builder with deadline management',
      'Gradebook with editable grade entries',
      'At-risk student detection and alert system',
      'Student notes and annotation panel',
      'Weekly schedule and calendar integration',
    ],
  },
  {
    role: 'Administrators',
    icon: 'admin_panel_settings',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    features: [
      'Admissions pipeline kanban (Applied to Enrolled)',
      'Budget allocation and reporting dashboards',
      'Enrollment trend analytics with chart visualizations',
      'Staff management (add, edit, deactivate)',
      'Institution-wide announcements composer',
      'Compliance and export report builder',
    ],
  },
  {
    role: 'Parents and Guardians',
    icon: 'family_restroom',
    color: 'text-purple-600',
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    features: [
      'Daily activity summary for each child',
      'Daily reports (meals, nap times, activities)',
      'Upcoming events and permission slip approvals',
      'Direct messaging with teachers',
      'Photo gallery access and download',
      'Push notifications for urgent updates',
    ],
  },
  {
    role: 'Club Leaders and Student Reps',
    icon: 'groups',
    color: 'text-amber-600',
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    features: [
      'Member management table with status tracking',
      'Event creation with RSVP and waitlist management',
      'Club budget tracker with expense logging',
      'Venue booking request and approval workflow',
      'Recruitment pipeline for new member acquisition',
      'Announcement composer for club channels',
    ],
  },
  {
    role: 'Coaches',
    icon: 'sports',
    color: 'text-orange-600',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    features: [
      'Team roster with athlete profiles and photos',
      'Training schedule calendar with session planning',
      'Performance tracker with radar chart visualization',
      'Game score entry and results archive',
      'Athlete health and injury log',
      'Team communication and announcement panel',
    ],
  },
  {
    role: 'IT Directors',
    icon: 'developer_mode',
    color: 'text-slate-600',
    bg: 'bg-slate-100 dark:bg-slate-700/30',
    features: [
      'RBAC user management and role assignment',
      'SSO, LDAP, and Google Workspace integration',
      'API documentation with curl example explorer',
      'System health and uptime metrics',
      'Full audit log with filter and export',
      'Webhook configuration for external integrations',
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
            Campus Tribe is a unified platform where every stakeholder has a purpose-built experience. Explore features by role.
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
