import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function AdminSettings() {
  const [lms, setLms] = useState({ url: '', api_key: '', provider: 'canvas' });
  const [helcim, setHelcim] = useState({ account_id: '', api_token: '' });
  const [saved, setSaved] = useState<string | null>(null);

  const saveSection = (section: string) => {
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Settings</h1>

      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-4">LMS Integration</h2>
        <div className="space-y-3">
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">Provider</label>
            <select value={lms.provider} onChange={e => setLms({ ...lms, provider: e.target.value })}
              className={inputCls}>
              <option value="canvas">Canvas</option>
              <option value="moodle">Moodle</option>
              <option value="blackboard">Blackboard</option>
              <option value="google_classroom">Google Classroom</option>
            </select>
          </div>
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">LMS URL</label>
            <input value={lms.url} onChange={e => setLms({ ...lms, url: e.target.value })} placeholder="https://yourschool.instructure.com" className={inputCls} />
          </div>
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">API Key</label>
            <input type="password" value={lms.api_key} onChange={e => setLms({ ...lms, api_key: e.target.value })} placeholder="••••••••" className={inputCls} />
          </div>
          <Button onClick={() => saveSection('lms')} className="rounded-full">
            {saved === 'lms' ? '✓ Saved' : 'Save LMS Config'}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-4">Helcim Payments</h2>
        <div className="space-y-3">
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">Account ID</label>
            <input value={helcim.account_id} onChange={e => setHelcim({ ...helcim, account_id: e.target.value })} placeholder="Helcim account ID" className={inputCls} />
          </div>
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">API Token</label>
            <input type="password" value={helcim.api_token} onChange={e => setHelcim({ ...helcim, api_token: e.target.value })} placeholder="••••••••" className={inputCls} />
          </div>
          <Button onClick={() => saveSection('helcim')} className="rounded-full">
            {saved === 'helcim' ? '✓ Saved' : 'Save Helcim Config'}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-4">Platform</h2>
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
