import { useState } from 'react';
import PublicNav from '../../components/layout/PublicNav';
import PublicFooter from '../../components/layout/PublicFooter';

const faqs = [
  { q: 'How long does onboarding take?', a: 'Most institutions are live within 2 weeks. We handle data migration, SSO setup, and staff training as part of every plan.' },
  { q: 'Is Campus Tribe FERPA and GDPR compliant?', a: 'Yes. We are fully FERPA, GDPR, and COPPA compliant. All student data is encrypted at rest and in transit with 256-bit AES encryption.' },
  { q: 'Can we integrate with our existing LMS?', a: 'Yes. We have native integrations with Canvas, Blackboard, Moodle, and Google Classroom. Custom API integrations are available on Enterprise plans.' },
  { q: 'What is included in the free trial?', a: 'The 30-day trial includes full platform access for up to 500 students. No credit card required. We provide a dedicated success manager throughout your trial.' },
  { q: 'Do you offer pricing discounts for smaller institutions?', a: 'Yes. We have special pricing for community colleges, preschools, and institutions under 1,000 students. Contact our team for a custom quote.' },
  { q: 'What kind of support is included?', a: 'All plans include email support. Professional and Enterprise plans include live chat, phone support, and a dedicated Customer Success Manager.' },
];

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', institution: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('https://ncftkuuxfllyohixiusb.supabase.co/functions/v1/send-demo-request-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jZnRrdXV4ZmxseW9oaXhpdXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MjI1MTAsImV4cCI6MjA4MTI5ODUxMH0.qMXAzX_5R7Tsu32PLgZqz5C4oSQ9tMLmsbFp8k87ao17_S-M6ik' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          institution: form.institution,
          subject: form.subject || 'Support Request',
          message: form.message,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      setError('Failed to send message. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background dark:bg-slate-950 min-h-screen">
      <PublicNav />
      <main className="pt-28">
        <section className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center mb-16">
            <span className="font-label font-bold text-xs uppercase text-secondary tracking-widest">Support</span>
            <h1 className="font-headline font-extrabold text-5xl lg:text-6xl text-on-surface dark:text-slate-50 tracking-tight mt-4 mb-4">
              We Are Here to Help.
            </h1>
            <p className="text-xl text-on-surface-variant dark:text-slate-400 max-w-xl mx-auto">
              Send us a message and our team will respond within 1 business day.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-surface-container-lowest dark:bg-slate-800 p-10 rounded-2xl shadow-sm">
              <h2 className="font-headline font-bold text-2xl text-on-surface dark:text-slate-100 mb-6">Send a Message</h2>
              {submitted ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-tertiary mb-4 block">check_circle</span>
                  <h3 className="font-headline font-bold text-2xl dark:text-slate-100 mb-2">Message Received!</h3>
                  <p className="text-on-surface-variant dark:text-slate-400">We will get back to you within 1 business day.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your name' },
                    { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@institution.edu' },
                    { label: 'Institution', key: 'institution', type: 'text', placeholder: 'University / School name' },
                    { label: 'Subject', key: 'subject', type: 'text', placeholder: 'Brief subject line' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-label font-bold text-on-surface dark:text-slate-200 mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key as keyof typeof form]}
                        onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border border-outline-variant dark:border-slate-600 bg-background dark:bg-slate-900 text-on-surface dark:text-slate-100 focus:outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-label font-bold text-on-surface dark:text-slate-200 mb-1">Message</label>
                    <textarea
                      rows={5}
                      placeholder="How can we help?"
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border border-outline-variant dark:border-slate-600 bg-background dark:bg-slate-900 text-on-surface dark:text-slate-100 focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm font-jakarta">{error}</p>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-full hover:bg-primary-dim transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div>
              <h2 className="font-headline font-bold text-2xl text-on-surface dark:text-slate-100 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl overflow-hidden border border-outline-variant/20">
                    <button
                      className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="font-headline font-bold text-sm text-on-surface dark:text-slate-100">{faq.q}</span>
                      <span className="material-symbols-outlined text-on-surface-variant shrink-0 transition-transform" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none' }}>
                        expand_more
                      </span>
                    </button>
                    {openFaq === i && (
                      <div className="px-6 pb-5">
                        <p className="text-sm text-on-surface-variant dark:text-slate-400 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
