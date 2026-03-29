import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { BookOpen, CreditCard, Settings } from 'lucide-react';

export default function AdminSettings() {
  const [lms, setLms] = useState({ url: '', ltiKeyId: '', ltiKeySecret: '', provider: 'canvas' });
  const [helcim, setHelcim] = useState({ apiKey: '', webhookUrl: '' });
  const [saved, setSaved] = useState<string | null>(null);

  const saveSection = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30';
  const lmsConnected = lms.url.length > 0 && lms.ltiKeyId.length > 0;
  const helcimConnected = helcim.apiKey.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Settings</h1>

      {/* LMS Integration — Module 12 */}
      <Card id="lms">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={18} className="text-primary" />
          <h2 className="font-lexend font-bold text-on-surface">LMS Integration — Canvas LTI 1.3</h2>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${lmsConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className={`text-xs font-jakarta font-700 ${lmsConnected ? 'text-green-700 dark:text-green-400' : 'text-on-surface-variant'}`}>
            {lmsConnected ? 'Connected' : 'Not configured'}
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">LMS Provider</label>
            <select value={lms.provider} onChange={e => setLms({ ...lms, provider: e.target.value })} className={inputCls}>
              <option value="canvas">Canvas (Instructure)</option>
              <option value="moodle">Moodle</option>
              <option value="blackboard">Blackboard Ultra</option>
              <option value="google_classroom">Google Classroom</option>
            </select>
          </div>
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">Canvas Instance URL</label>
            <input value={lms.url} onChange={e => setLms({ ...lms, url: e.target.value })} placeholder="https://institution.instructure.com" className={inputCls} />
          </div>
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">LTI Key ID</label>
            <input value={lms.ltiKeyId} onChange={e => setLms({ ...lms, ltiKeyId: e.target.value })} placeholder="LTI 1.3 key ID" className={inputCls} />
          </div>
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">LTI Key Secret</label>
            <input type="password" value={lms.ltiKeySecret} onChange={e => setLms({ ...lms, ltiKeySecret: e.target.value })} placeholder="••••••••" className={inputCls} />
          </div>
          <Button onClick={() => saveSection('lms')} className="rounded-full">
            {saved === 'lms' ? '✓ Saved' : 'Connect Canvas'}
          </Button>
        </div>
      </Card>

      {/* Helcim Payments — Module 16 */}
      <Card id="payments">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard size={18} className="text-primary" />
          <h2 className="font-lexend font-bold text-on-surface">Payment Integration — Helcim</h2>
        </div>
        <p className="text-sm text-on-surface-variant font-jakarta mb-2">Configure Helcim for club dues, event tickets, and intramural fees.</p>
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${helcimConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className={`text-xs font-jakarta font-700 ${helcimConnected ? 'text-green-700 dark:text-green-400' : 'text-on-surface-variant'}`}>
            {helcimConnected ? 'Connected' : 'Not configured'}
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">Helcim API Key</label>
            <input type="password" value={helcim.apiKey} onChange={e => setHelcim({ ...helcim, apiKey: e.target.value })} placeholder="sk_live_..." className={inputCls} />
          </div>
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">Helcim Webhook URL</label>
            <input value={helcim.webhookUrl} onChange={e => setHelcim({ ...helcim, webhookUrl: e.target.value })} placeholder="https://your-site.com/api/helcim/webhook" className={inputCls} />
          </div>
          <Button onClick={() => saveSection('helcim')} className="rounded-full">
            {saved === 'helcim' ? '✓ Saved' : 'Save Helcim Config'}
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Settings size={18} className="text-primary" />
          <h2 className="font-lexend font-bold text-on-surface">Platform</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-jakarta font-bold text-on-surface text-sm">Student Registration</p>
              <p className="text-xs text-on-surface-variant">Allow new students to self-register</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-jakarta font-bold text-on-surface text-sm">Club Creation Requires Approval</p>
              <p className="text-xs text-on-surface-variant">New clubs must be approved by admin</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-jakarta font-bold text-on-surface text-sm">Wellness Check-ins</p>
              <p className="text-xs text-on-surface-variant">Enable mood tracking for students</p>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
          </div>
          <Button onClick={() => saveSection('platform')} className="rounded-full">
            {saved === 'platform' ? '✓ Saved' : 'Save Platform Config'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
