import { Link } from 'react-router-dom';
import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';

const articles = [
  {
    title: 'The 14-Point Retention Gap: How Student Engagement Predicts Who Stays',
    category: 'Research',
    date: 'Apr 5, 2026',
    readTime: '10 min read',
    excerpt: 'Universities with high student engagement scores report retention rates 14 percentage points above the national average. New data from 300 institutions shows exactly which engagement signals predict dropout risk months before a student stops showing up.',
    img: '/assets/campus-students.jpg',
    author: 'Campus Tribe Research Team',
  },
  {
    title: 'From 8 Vendors to 1: How IT Directors Are Cutting EdTech Sprawl',
    category: 'Strategy',
    date: 'Apr 3, 2026',
    readTime: '8 min read',
    excerpt: 'The average university IT department manages 8 separate student engagement tools. CIOs who consolidated onto a single SOC 2 + FERPA-compliant platform with SAML SSO cut support tickets by 60% and freed up 1,200 staff hours per year.',
    img: '/assets/campus-admin.jpg',
    author: 'Campus Tribe Research Team',
  },
  {
    title: 'Title IX Compliance in 10 Minutes: How Athletics Directors Are Using Automation',
    category: 'Product',
    date: 'Apr 1, 2026',
    readTime: '6 min read',
    excerpt: 'Manual Title IX reporting was taking athletics departments 40+ hours per semester. With integrated season scheduling, live scores, and one-click compliance exports, departments are completing full reports in under 10 minutes.',
    img: '/assets/campus-sports.jpg',
    author: 'Campus Tribe Research Team',
  },
  {
    title: 'Student Government in the Digital Age: Faster Clubs, Higher Turnout',
    category: 'Case Study',
    date: 'Mar 28, 2026',
    readTime: '7 min read',
    excerpt: 'Student councils using digital club registration cut approval time from 3 weeks to 3 days. Push notification open rates hit 98% when messages come from student reps rather than administration. Here is what the data shows about peer-to-peer engagement.',
    img: '/assets/campus-clubs.jpg',
    author: 'Campus Tribe Research Team',
  },
  {
    title: 'One Platform, Five Problems: Why Principals Are Replacing 4 Tools at Once',
    category: 'Strategy',
    date: 'Mar 24, 2026',
    readTime: '9 min read',
    excerpt: 'Parent communications, activity management, compliance tracking, emergency alerts, and staff coordination were each running on separate tools in most schools. Principals who unified onto one platform report 35% less administrative overhead and faster emergency response times.',
    img: '/assets/campus-school.jpg',
    author: 'Campus Tribe Research Team',
  },
  {
    title: 'Teachers Spend 2.4 Hours a Day on Admin. Here Is Where That Time Goes',
    category: 'Research',
    date: 'Mar 19, 2026',
    readTime: '11 min read',
    excerpt: 'A study of 1,200 teachers across K-12 and higher education found that attendance, parent messaging, homework tracking, and behavior logging each live in separate systems. Faculty who consolidate these into one workflow reclaim nearly 2 full teaching days per week.',
    img: '/assets/campus-teachers.jpg',
    author: 'Campus Tribe Research Team',
  },
];

const categoryColors: Record<string, string> = {
  'Case Study': 'bg-tertiary/10 text-tertiary',
  'Research': 'bg-primary/10 text-primary',
  'Product': 'bg-secondary/10 text-secondary',
  'Design': 'bg-purple-100 text-purple-700',
  'Strategy': 'bg-amber-100 text-amber-700',
  'News': 'bg-green-100 text-green-700',
};

export default function BlogPage() {
  return (
    <div className="bg-background dark:bg-slate-950 min-h-screen">
      <PublicNav />
      <main className="pt-28">
        <section className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center mb-12">
            <span className="font-label font-bold text-xs uppercase text-secondary tracking-widest">Campus Tribe Blog</span>
            <h1 className="font-headline font-extrabold text-5xl lg:text-6xl text-on-surface dark:text-slate-50 tracking-tight mt-4 mb-4">
              Insights for Campus Leaders
            </h1>
            <p className="text-xl text-on-surface-variant dark:text-slate-400 max-w-2xl mx-auto">
              Market research, case studies, product updates, and strategy guides for modern educational institutions.
            </p>
          </div>

          {/* Featured */}
          <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl mb-12 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="grid lg:grid-cols-2">
              <picture>
                <source type="image/webp" srcSet={articles[0].img.replace('.jpg', '.webp')} />
                <img src={articles[0].img} alt={articles[0].title} className="w-full h-64 lg:h-full object-cover" />
              </picture>
              <div className="p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${categoryColors[articles[0].category]}`}>{articles[0].category}</span>
                  <span className="text-sm text-on-surface-variant dark:text-slate-400">{articles[0].date} &middot; {articles[0].readTime}</span>
                </div>
                <h2 className="font-headline font-bold text-3xl text-on-surface dark:text-slate-100 mb-4">{articles[0].title}</h2>
                <p className="text-on-surface-variant dark:text-slate-400 leading-relaxed mb-6">{articles[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant dark:text-slate-500 font-medium">{articles[0].author}</span>
                  <Link to="/blog" className="text-primary font-headline font-bold flex items-center gap-2 hover:gap-4 transition-all">
                    Read More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(1).map(article => (
              <div key={article.title} className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <picture>
                  <source type="image/webp" srcSet={article.img.replace('.jpg', '.webp')} />
                  <img src={article.img} alt={article.title} className="w-full h-48 object-cover" />
                </picture>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${categoryColors[article.category]}`}>{article.category}</span>
                    <span className="text-xs text-on-surface-variant dark:text-slate-400">{article.readTime}</span>
                  </div>
                  <h3 className="font-headline font-bold text-lg text-on-surface dark:text-slate-100 mb-3 leading-tight">{article.title}</h3>
                  <p className="text-sm text-on-surface-variant dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-on-surface-variant dark:text-slate-500">{article.date}</span>
                    <Link to="/blog" className="text-primary text-sm font-headline font-bold hover:underline">Read More</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
