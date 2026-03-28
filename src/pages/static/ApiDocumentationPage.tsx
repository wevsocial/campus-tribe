import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';
import { apiReference, publicApiReviewHighlights } from '../../data/apiReference';

export default function ApiDocumentationPage() {
  return (
    <div className="bg-background dark:bg-slate-950 min-h-screen">
      <PublicNav />
      <main className="pt-28">
        <section className="max-w-7xl mx-auto px-8 py-16">
          <div className="max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-label font-bold uppercase tracking-[0.18em] text-primary">
              Resources · API Documentation
            </span>
            <h1 className="mt-6 font-headline text-5xl lg:text-6xl font-black tracking-tight text-on-surface dark:text-slate-50">
              API access, integration review, and institutional readiness.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-on-surface-variant dark:text-slate-400">
              This page is the public-safe review layer for Campus Tribe APIs. It gives IT leaders and institutional buyers a clear view of the integration surface without disclosing sensitive internal intellectual property.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-8 pb-8">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
            <div className="rounded-[1.5rem] bg-primary p-10 text-white shadow-xl shadow-primary/20">
              <p className="font-label text-xs font-bold uppercase tracking-[0.16em] text-primary-fixed-dim">What institutions can review immediately</p>
              <ul className="mt-6 space-y-4 text-sm leading-6 text-white/85">
                {publicApiReviewHighlights.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-secondary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.5rem] bg-surface-container-lowest dark:bg-slate-900 p-8 shadow-sm border border-outline-variant/15">
              <h2 className="font-headline text-2xl font-bold text-on-surface dark:text-slate-100">Access model</h2>
              <div className="mt-6 space-y-5 text-sm text-on-surface-variant dark:text-slate-400">
                <div>
                  <p className="font-label text-xs font-bold uppercase tracking-[0.12em] text-secondary mb-2">Public review</p>
                  <p>Architecture summary, domain coverage, security posture, and representative endpoint families.</p>
                </div>
                <div>
                  <p className="font-label text-xs font-bold uppercase tracking-[0.12em] text-secondary mb-2">Logged-in IT admin access</p>
                  <p>Full endpoint reference, API keys, integration toggles, operational review pages, and audit visibility inside the IT workspace after authentication.</p>
                </div>
                <div>
                  <p className="font-label text-xs font-bold uppercase tracking-[0.12em] text-secondary mb-2">Enterprise enablement</p>
                  <p>Institution-specific scopes, SSO/SAML mapping, webhook contracts, SIS/LMS planning, and supervised rollout.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {apiReference.map((category) => (
              <article key={category.id} className="rounded-[1.5rem] bg-surface-container-lowest dark:bg-slate-900 p-7 shadow-sm border border-outline-variant/15">
                <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-primary">{category.audience}</p>
                <h2 className="mt-3 font-headline text-2xl font-bold text-on-surface dark:text-slate-100">{category.title}</h2>
                <p className="mt-3 text-sm leading-6 text-on-surface-variant dark:text-slate-400">{category.summary}</p>
                <div className="mt-5 space-y-3">
                  {category.endpoints.slice(0, 3).map((endpoint) => (
                    <div key={`${category.id}-${endpoint.path}`} className="rounded-[1rem] bg-surface dark:bg-slate-800 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-label font-bold uppercase tracking-[0.08em] ${endpoint.method === 'GET' ? 'bg-tertiary-container text-tertiary-dim' : endpoint.method === 'POST' ? 'bg-primary-container text-primary' : endpoint.method === 'PUT' ? 'bg-secondary-container text-secondary-dim' : 'bg-red-100 text-red-600'}`}>
                          {endpoint.method}
                        </span>
                        <code className="text-xs text-on-surface dark:text-slate-100">{endpoint.path}</code>
                      </div>
                      <p className="text-xs leading-5 text-on-surface-variant dark:text-slate-400">{endpoint.description}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
