import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const inputCls =
  'w-full px-4 py-3 rounded-xl text-sm font-jakarta ' +
  'border border-gray-200 dark:border-slate-600 ' +
  'bg-white dark:bg-slate-800 ' +
  'text-gray-900 dark:text-white placeholder-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors';

const INSTITUTION_TYPES = ['University', 'School', 'Preschool'];
const STUDENT_COUNTS = ['<100', '100-500', '500-2000', '2000+'];

export function DemoRequestForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [institutionType, setInstitutionType] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!institutionType) { setError('Please select an institution type.'); return; }
    if (!studentCount) { setError('Please select a student count range.'); return; }
    setSubmitting(true);
    try {
      const { error: dbError } = await supabase.from('ct_demo_requests').insert({
        full_name: fullName,
        email,
        institution_name: institutionName,
        institution_type: institutionType,
        student_count: studentCount,
        message: message || null,
      });
      if (dbError) throw dbError;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-20 px-6 bg-surface dark:bg-slate-950">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="font-lexend font-extrabold text-3xl lg:text-4xl text-gray-900 dark:text-white">
            Book a personalized demo
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-3 font-jakarta text-lg">
            See Campus Tribe in action — tailored to your institution.
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300 rounded-3xl px-8 py-10 text-center font-jakarta">
            <div className="text-4xl mb-3">🎉</div>
            <p className="font-bold text-lg">We'll be in touch within 24 hours! 🎉</p>
            <p className="text-sm mt-1 opacity-80">Our team will reach out to schedule your personalized demo.</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container dark:bg-slate-900 rounded-3xl p-8 lg:p-10 space-y-6 border border-gray-100 dark:border-slate-800"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-jakarta font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-jakarta font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@university.edu"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-jakarta font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Institution Name</label>
              <input
                type="text"
                value={institutionName}
                onChange={e => setInstitutionName(e.target.value)}
                placeholder="McGill University"
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-jakarta font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-3">Institution Type</label>
              <div className="flex flex-wrap gap-3">
                {INSTITUTION_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="institutionType"
                      value={type}
                      checked={institutionType === type}
                      onChange={() => setInstitutionType(type)}
                      className="accent-blue-600"
                    />
                    <span className="font-jakarta text-sm text-gray-900 dark:text-white">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-jakarta font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Number of Students</label>
              <select
                value={studentCount}
                onChange={e => setStudentCount(e.target.value)}
                required
                className={inputCls}
              >
                <option value="">Select range…</option>
                {STUDENT_COUNTS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-jakarta font-bold text-gray-500 dark:text-slate-400 uppercase tracking-widest mb-2">Message <span className="normal-case font-normal">(optional)</span></label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell us about your institution's needs…"
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-2xl font-jakarta">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-jakarta font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending…' : 'Request Demo →'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export default DemoRequestForm;
