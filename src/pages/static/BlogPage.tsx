import { Link } from 'react-router-dom';
import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';

const articles = [
  {
    title: 'How Smart Matching Increased Club Membership by 340% at Oxford',
    category: 'Case Study',
    date: 'Mar 15, 2026',
    readTime: '8 min read',
    excerpt: 'When Oxford partnered with Campus Tribe, they had a simple goal: help students find their community faster. The results exceeded every benchmark.',
    img: '/assets/campus-events.jpg',
  },
  {
    title: 'The Student Wellbeing Crisis and What EdTech Can Do About It',
    category: 'Research',
    date: 'Mar 8, 2026',
    readTime: '12 min read',
    excerpt: 'Loneliness rates among university students have reached record highs. We explore the root causes and how engagement technology can help.',
    img: '/assets/campus-clubs.jpg',
  },
  {
    title: 'Intramural Sports Scheduling: From Chaos to Championship',
    category: 'Product',
    date: 'Feb 28, 2026',
    readTime: '6 min read',
    excerpt: 'Manual bracket management was costing athletic departments hundreds of hours per semester. Here is how Campus Tribe automated the entire process.',
    img: '/assets/campus-wellbeing.jpg',
  },
  {
    title: 'Building a Preschool Parent Portal That Parents Actually Use',
    category: 'Design',
    date: 'Feb 20, 2026',
    readTime: '7 min read',
    excerpt: 'Most parent communication tools feel like IT projects. We took a different approach - start with the parent, not the feature list.',
    img: '/assets/campus-venues.jpg',
  },
  {
    title: 'ROI of Student Engagement: A Framework for Admissions Teams',
    category: 'Strategy',
    date: 'Feb 12, 2026',
    readTime: '10 min read',
    excerpt: 'Engagement metrics have a direct line to enrollment yield and retention. Here is how to measure and present the value to your board.',
    img: '/assets/campus-preschool.jpg',
  },
  {
    title: 'Campus Tribe Raises Series A to Expand Globally',
    category: 'News',
    date: 'Feb 5, 2026',
    readTime: '4 min read',
    excerpt: 'We are thrilled to announce our $12M Series A funding round, led by Sequoia Capital. This round accelerates our expansion into the UK, Australia, and Southeast Asia.',
    img: '/assets/campus-teachers.jpg',
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
              Research, case studies, product updates, and strategy guides for the modern educational institution.
            </p>
          </div>

          {/* Featured */}
          <div className="bg-surface-container-lowest dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl mb-12 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="grid lg:grid-cols-2">
              <img src={articles[0].img} alt={articles[0].title} className="w-full h-64 lg:h-full object-cover" />
              <div className="p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${categoryColors[articles[0].category]}`}>{articles[0].category}</span>
                  <span className="text-sm text-on-surface-variant dark:text-slate-400">{articles[0].date} - {articles[0].readTime}</span>
                </div>
                <h2 className="font-headline font-bold text-3xl text-on-surface dark:text-slate-100 mb-4">{articles[0].title}</h2>
                <p className="text-on-surface-variant dark:text-slate-400 leading-relaxed mb-6">{articles[0].excerpt}</p>
                <Link to="/blog" className="text-primary font-headline font-bold flex items-center gap-2 hover:gap-4 transition-all">
                  Read More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(1).map(article => (
              <div key={article.title} className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <img src={article.img} alt={article.title} className="w-full h-48 object-cover" />
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
