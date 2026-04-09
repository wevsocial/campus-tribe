import { Link, useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
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
  body?: string | null;
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
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function estimateReadTime(body: string | null): string {
  if (!body) return '2 min read';
  const words = body.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      navigate('/blog', { replace: true });
      return;
    }
    setLoading(true);
    setNotFound(false);

    supabase
      .from('ct_blog_posts')
      .select('id, title, slug, category, excerpt, author, image_url, body, published_at')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        setPost(data);
        // Fetch related posts (same category, different slug)
        supabase
          .from('ct_blog_posts')
          .select('id, title, slug, category, excerpt, author, image_url, published_at')
          .eq('category', data.category)
          .neq('slug', slug)
          .order('published_at', { ascending: false })
          .limit(3)
          .then(({ data: rel }) => {
            if (rel && rel.length) {
              setRelated(rel);
            } else {
              // Fall back to latest posts if no same-category
              supabase
                .from('ct_blog_posts')
                .select('id, title, slug, category, excerpt, author, image_url, published_at')
                .neq('slug', slug)
                .order('published_at', { ascending: false })
                .limit(3)
                .then(({ data: latest }) => setRelated(latest || []));
            }
          });
        setLoading(false);
      });
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="bg-background dark:bg-slate-950 min-h-screen">
        <PublicNav />
        <main className="pt-28 flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="bg-background dark:bg-slate-950 min-h-screen">
        <PublicNav />
        <main className="pt-28 max-w-3xl mx-auto px-8 py-24 text-center">
          <h1 className="font-headline font-bold text-4xl text-on-surface dark:text-white mb-4">
            Post Not Found
          </h1>
          <p className="text-on-surface-variant dark:text-slate-400 mb-8">
            This article doesn't exist or may have been removed.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-headline font-bold hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Render body text as paragraphs (split by newlines)
  const paragraphs = (post.body || post.excerpt)
    .split('\n')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div className="bg-background dark:bg-slate-950 min-h-screen">
      <PublicNav />
      <main className="pt-28">
        {/* Hero */}
        <div className="relative w-full max-h-[480px] overflow-hidden">
          <picture>
            <source type="image/webp" srcSet={post.image_url.replace('.jpg', '.webp')} />
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full object-cover max-h-[480px]"
              style={{ objectPosition: 'center 30%' }}
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-8 pb-12">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                  categoryColors[post.category] ?? 'bg-slate-100 text-slate-600'
                }`}
              >
                {post.category}
              </span>
            </div>
            <h1 className="font-headline font-extrabold text-3xl lg:text-5xl text-white leading-tight">
              {post.title}
            </h1>
          </div>
        </div>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-8 py-12">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-headline font-bold mb-8"
          >
            <ArrowLeft size={14} /> All Articles
          </Link>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-5 text-sm text-on-surface-variant dark:text-slate-400 mb-8 border-b border-outline/20 dark:border-slate-700 pb-8">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag size={14} />
              {estimateReadTime(post.body ?? null)}
            </span>
          </div>

          {/* Excerpt (lead) */}
          <p className="text-xl text-on-surface dark:text-slate-200 font-headline leading-relaxed mb-8 font-medium">
            {post.excerpt}
          </p>

          {/* Body */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {paragraphs.map((para, i) => (
              <p
                key={i}
                className="text-on-surface-variant dark:text-slate-300 leading-relaxed mb-5 text-base"
              >
                {para}
              </p>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl p-8 text-center">
            <h3 className="font-headline font-bold text-2xl text-on-surface dark:text-white mb-3">
              See Campus Tribe in Action
            </h3>
            <p className="text-on-surface-variant dark:text-slate-400 mb-6 max-w-xl mx-auto">
              Join hundreds of institutions already transforming their campus engagement.
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full font-headline font-bold hover:bg-primary/90 transition-colors"
            >
              Request a Demo
            </Link>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section className="max-w-7xl mx-auto px-8 pb-16">
            <h2 className="font-headline font-bold text-2xl text-on-surface dark:text-white mb-8">
              Related Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="bg-surface-container-lowest dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
                >
                  <picture>
                    <source type="image/webp" srcSet={rel.image_url.replace('.jpg', '.webp')} />
                    <img src={rel.image_url} alt={rel.title} className="w-full h-44 object-cover" />
                  </picture>
                  <div className="p-5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        categoryColors[rel.category] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rel.category}
                    </span>
                    <h3 className="font-headline font-bold text-base text-on-surface dark:text-slate-100 mt-2 leading-snug line-clamp-2">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1">
                      {formatDate(rel.published_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
