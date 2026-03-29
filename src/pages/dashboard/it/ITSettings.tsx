import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Shield, Database, ExternalLink } from 'lucide-react';

export default function ITSettings() {
  const [saved, setSaved] = useState('');
  const [session, setSession] = useState({ timeout: '30', mfa: true, audit: true });
  const [retention, setRetention] = useState({ studentData: '7', auditLogs: '3', backups: '1' });
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

      {/* FERPA Compliance — Module 15 */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-primary" />
          <h2 className="font-lexend font-bold text-on-surface">FERPA Compliance</h2>
        </div>
        <p className="text-sm text-on-surface-variant font-jakarta mb-4">
          FERPA (Family Educational Rights and Privacy Act) compliance requires maintaining audit logs of all student record access.
        </p>
        <div className="flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 mb-4">
          <div>
            <p className="font-jakarta font-700 text-green-800 dark:text-green-400 text-sm">FERPA Audit Logging Active</p>
            <p className="text-xs text-green-700 dark:text-green-500">All student data access is logged and auditable</p>
          </div>
          <span className="text-green-500">✓</span>
        </div>
        <Link to="/dashboard/it/audit"
          className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-primary text-primary font-jakarta text-sm font-700 hover:bg-primary hover:text-white transition-colors w-fit"
        >
          <ExternalLink size={14} />
          View FERPA Audit Log
        </Link>
      </Card>

      {/* Data Retention Policy — Module 15 */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Database size={18} className="text-primary" />
          <h2 className="font-lexend font-bold text-on-surface">Data Retention Policy</h2>
        </div>
        <p className="text-sm text-on-surface-variant font-jakarta mb-4">Configure how long different types of data are retained before automatic deletion.</p>
        <div className="space-y-4">
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">Student Records Retention (years)</label>
            <input type="number" value={retention.studentData} onChange={e => setRetention({ ...retention, studentData: e.target.value })} className={inputCls} min={1} max={25} />
          </div>
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">Audit Log Retention (years)</label>
            <input type="number" value={retention.auditLogs} onChange={e => setRetention({ ...retention, auditLogs: e.target.value })} className={inputCls} min={1} max={10} />
          </div>
          <div>
            <label className="font-jakarta text-sm font-bold text-on-surface-variant mb-1 block">Backup Retention (years)</label>
            <input type="number" value={retention.backups} onChange={e => setRetention({ ...retention, backups: e.target.value })} className={inputCls} min={1} max={5} />
          </div>
          <Button onClick={() => save('retention')} className="rounded-full">{saved === 'retention' ? '✓ Saved' : 'Save Retention Policy'}</Button>
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
