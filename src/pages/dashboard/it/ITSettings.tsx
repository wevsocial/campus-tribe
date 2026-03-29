import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function ITSettings() {
  const [saved, setSaved] = useState('');
  const [session, setSession] = useState({ timeout: '30', mfa: true, audit: true });
  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30';

  const save = (section: string) => { setSaved(section); setTimeout(() => setSaved(''), 2000); };

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">IT Settings</h1>

      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-4">Security & Sessions</h2>
        <div className="space-y-4">
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">Session Timeout (minutes)</label>
            <input type="number" value={session.timeout} onChange={e => setSession({ ...session, timeout: e.target.value })} className={inputCls} min={5} max={480} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-jakarta font-bold text-on-surface text-sm">Require MFA</p>
              <p className="text-xs text-on-surface-variant">Enforce multi-factor authentication for admins</p>
            </div>
            <input type="checkbox" checked={session.mfa} onChange={e => setSession({ ...session, mfa: e.target.checked })} className="w-4 h-4 accent-primary" />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-jakarta font-bold text-on-surface text-sm">Audit Logging</p>
              <p className="text-xs text-on-surface-variant">Log all admin and IT actions</p>
            </div>
            <input type="checkbox" checked={session.audit} onChange={e => setSession({ ...session, audit: e.target.checked })} className="w-4 h-4 accent-primary" />
          </div>
          <Button onClick={() => save('security')} className="rounded-full">{saved === 'security' ? '✓ Saved' : 'Save Security Config'}</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-4">Platform Configuration</h2>
        <div className="space-y-3">
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">Platform Environment</label>
            <select className={inputCls}><option>Production</option><option>Staging</option><option>Development</option></select>
          </div>
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">Support Email</label>
            <input type="email" placeholder="support@yourinstitution.edu" className={inputCls} />
          </div>
          <Button onClick={() => save('platform')} className="rounded-full">{saved === 'platform' ? '✓ Saved' : 'Save Platform Config'}</Button>
        </div>
      </Card>
    </div>
  );
}
