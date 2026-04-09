import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';
import { supabase } from '../../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  author: string;
  image_url: string;
  published_at: string;
}

const categoryColors: Record<string, string> = {
  'Case Study': 'bg-tertiary/10 text-tertiary',
  'Research': 'bg-primary/10 text-primary',
  'Product': 'bg-secondary/10 text-secondary',
  'Design': 'bg-purple-100 text-purple-700',
  'Strategy': 'bg-amber-100 text-amber-700',
  'News': 'bg-green-100 text-green-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function BlogPage() {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('ct_blog_posts')
      .select('id, title, slug, category, excerpt, author, image_url, published_at')
      .order('published_at', { ascending: false })
      .limit(12)
      .then(({ data, error }) => {
        if (!error && data) setArticles(data);
        setLoading(false);
      });
  }, []);

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

          {loading && (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && articles.length > 0 && (
            <>
              {/* Featured */}
              <Link
                to={`/blog/${articles[0].slug}`}
                className="block bg-surface-container-lowest dark:bg-slate-800 rounded-3xl overflow-hidden shadow-xl mb-12 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="grid lg:grid-cols-2">
                  <picture>
                    <source type="image/webp" srcSet={articles[0].image_url.replace('.jpg', '.webp')} />
                    <img src={articles[0].image_url} alt={articles[0].title} className="w-full h-64 lg:h-full object-cover" />
                  </picture>
                  <div className="p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${categoryColors[articles[0].category] ?? 'bg-slate-100 text-slate-600'}`}>{articles[0].category}</span>
                      <span className="text-sm text-on-surface-variant dark:text-slate-400">{formatDate(articles[0].published_at)}</span>
                    </div>
                    <h2 className="font-headline font-bold text-3xl text-on-surface dark:text-slate-100 mb-4">{articles[0].title}</h2>
                    <p className="text-on-surface-variant dark:text-slate-400 leading-relaxed mb-6">{articles[0].excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-on-surface-variant dark:text-slate-500 font-medium">{articles[0].author}</span>
                      <span className="text-primary font-headline font-bold flex items-center gap-2">
                        Read More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.slice(1).map(article => (
                  <div key={article.id} className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <Link to={`/blog/${article.slug}`} className="block">
                      <picture>
                        <source type="image/webp" srcSet={article.image_url.replace('.jpg', '.webp')} />
                        <img src={article.image_url} alt={article.title} className="w-full h-48 object-cover" />
                      </picture>
                    </Link>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${categoryColors[article.category] ?? 'bg-slate-100 text-slate-600'}`}>{article.category}</span>
                        <span className="text-xs text-on-surface-variant dark:text-slate-400">{formatDate(article.published_at)}</span>
                      </div>
                      <Link to={`/blog/${article.slug}`}>
                        <h3 className="font-headline font-bold text-lg text-on-surface dark:text-slate-100 mb-3 leading-tight hover:text-primary transition-colors">{article.title}</h3>
                      </Link>
                      <p className="text-sm text-on-surface-variant dark:text-slate-400 leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-on-surface-variant dark:text-slate-500">{article.author}</span>
                        <Link to={`/blog/${article.slug}`} className="text-primary text-sm font-headline font-bold hover:underline">Read More</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loading && articles.length === 0 && (
            <div className="text-center py-24 text-on-surface-variant dark:text-slate-400">
              <p className="text-lg">No articles published yet. Check back soon!</p>
            </div>
          )}
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
