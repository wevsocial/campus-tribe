import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';
import { useDashboardData } from '../../hooks/useDashboardData';
import { supabase } from '../../lib/supabase';
import { apiReference } from '../../data/apiReference';
import ProfilePhotoUpload from '../../components/ui/ProfilePhotoUpload';
import NotificationPrefsPanel from '../../components/ui/NotificationPrefsPanel';
import InstitutionRibbon from '../../components/InstitutionRibbon';
import EmailVerificationGate from '../../components/EmailVerificationGate';
import BillingSection from '../../components/billing/BillingSection';

const tabs = [
  { label: 'Users', hash: 'users' },
  { label: 'API Keys', hash: 'api-keys' },
  { label: 'API Docs', hash: 'api-docs' },
  { label: 'Audit Log', hash: 'audit' },
  { label: 'Integrations', hash: 'integrations' },
  { label: 'Billing', hash: 'billing' },
  { label: 'Settings', hash: 'settings' },
];

const integrationTemplates = [
  { key: 'canvas', name: 'Canvas LMS', description: 'Roster, course, and engagement sync' },
  { key: 'blackboard', name: 'Blackboard', description: 'Legacy LMS interoperability' },
  { key: 'brightspace', name: 'D2L Brightspace', description: 'Ontario-first LMS integration planning' },
  { key: 'google', name: 'Google Workspace', description: 'SSO and calendar connectivity' },
  { key: 'microsoft', name: 'Microsoft 365', description: 'Identity and productivity integration' },
  { key: 'webhooks', name: 'Webhook Relay', description: 'Outbound event delivery to institutional systems' },
];

function createApiKeyMaterial() {
  const seed = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const key = `ct_live_${seed}${Math.random().toString(36).slice(2, 10)}`;
  return {
    key,
    prefix: key.slice(0, 14),
    hash: key,
  };
}

export default function ITDashboard() {
  const { user, institutionId } = useAuth();
  const [activeTab, setActiveTab] = useState('Users');
  
  // Sync active tab with URL hash (driven by sidebar nav in DashboardLayout)
  React.useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const tabMap: Record<string, string> = {
      'users': 'Users',
      'api-keys': 'API Keys',
      'api-docs': 'API Docs',
      'audit': 'Audit Log',
      'integrations': 'Integrations',
      'settings': 'Settings',
    };
    if (hash && tabMap[hash]) {
      setActiveTab(tabMap[hash]);
    }
    const onHashChange = () => {
      const h = window.location.hash.replace('#', '');
      if (h && tabMap[h]) setActiveTab(tabMap[h]);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const [search, setSearch] = useState('');
  const [apiName, setApiName] = useState('');
  const [editingRole, setEditingRole] = useState<Record<string, string>>({});
  const [editingAthlete, setEditingAthlete] = useState<Record<string, boolean>>({});
  const [roleFlash, setRoleFlash] = useState<Record<string, string>>({});

  const ALL_ROLES = ['student', 'student_rep', 'teacher', 'club_leader', 'coach', 'it_director', 'staff', 'admin', 'parent', 'athlete'];

  const saveUserRole = async (userId: string, currentRoles: string[] | null) => {
    const newRole = editingRole[userId];
    if (!newRole || !user?.id) return;
    const isAthlete = editingAthlete[userId] ?? (currentRoles || []).includes('athlete');
    const baseRoles = (currentRoles || []).filter((r: string) => r !== 'athlete' && r !== newRole);
    const newRoles = isAthlete
      ? [...new Set([newRole, ...baseRoles, 'athlete'])]
      : [...new Set([newRole, ...baseRoles])];

    const { error } = await supabase.from('ct_users').update({ role: newRole, roles: newRoles }).eq('id', userId);
    if (!error) {
      setData((prev: any) => ({
        ...prev,
        users: prev.users.map((u: any) => u.id === userId ? { ...u, role: newRole, roles: newRoles } : u),
      }));
      setRoleFlash((f) => ({ ...f, [userId]: '✓ Saved' }));
      setTimeout(() => setRoleFlash((f) => { const n = { ...f }; delete n[userId]; return n; }), 3000);
      // Audit log — fire and forget, never block the save
      void supabase.from('ct_audit_logs').insert({
        institution_id: institutionId,
        actor_id: user.id,
        action: 'role_update',
        resource_type: 'ct_users',
        resource_id: userId,
        severity: 'info',
        metadata: { new_role: newRole, new_roles: newRoles },
      });
    } else {
      setRoleFlash((f) => ({ ...f, [userId]: '✗ Error: ' + (error.message || 'save failed') }));
      setTimeout(() => setRoleFlash((f) => { const n = { ...f }; delete n[userId]; return n; }), 4000);
    }
  };
  const [integrationMessage, setIntegrationMessage] = useState<Record<string, string>>({});
  const [lmsConfigs, setLmsConfigs] = useState<Record<string, { apiKey: string; baseUrl: string; lastSync: string | null; courseCount: number }>>({
    canvas: { apiKey: '', baseUrl: 'https://canvas.instructure.com', lastSync: null, courseCount: 0 },
    moodle: { apiKey: '', baseUrl: 'https://moodlecloud.com', lastSync: null, courseCount: 0 },
  });
  const [testingLms, setTestingLms] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const testLmsConnection = async (lms: string) => {
    setTestingLms(lms);
    const cfg = lmsConfigs[lms];
    try {
      if (lms === 'canvas') {
        const res = await fetch(`${cfg.baseUrl}/api/v1/courses?per_page=1`, {
          headers: { Authorization: `Bearer ${cfg.apiKey}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTestResult(r => ({ ...r, [lms]: { ok: true, msg: `Connected! ${data.length} course(s) returned.` } }));
        } else {
          setTestResult(r => ({ ...r, [lms]: { ok: false, msg: `HTTP ${res.status}` } }));
        }
      } else if (lms === 'moodle') {
        const res = await fetch(`${cfg.baseUrl}/webservice/rest/server.php?wstoken=${cfg.apiKey}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json`);
        const body = await res.json();
        if (body.sitename) {
          setTestResult(r => ({ ...r, [lms]: { ok: true, msg: `Connected to: ${body.sitename}` } }));
        } else {
          setTestResult(r => ({ ...r, [lms]: { ok: false, msg: body.message || 'Auth failed' } }));
        }
      }
    } catch (e: any) {
      setTestResult(r => ({ ...r, [lms]: { ok: false, msg: e.message } }));
    }
    setTestingLms(null);
  };

  const saveLmsConfig = async (lms: string) => {
    if (!institutionId) return;
    await supabase.from('ct_institution_settings').upsert(
      { institution_id: institutionId, key: `lms_${lms}_config`, value: JSON.stringify(lmsConfigs[lms]) },
      { onConflict: 'institution_id,key' }
    );
    setIntegrationMessage(m => ({ ...m, [lms]: 'Config saved.' }));
    setTimeout(() => setIntegrationMessage(m => ({ ...m, [lms]: '' })), 2000);
  };

  const { data, setData } = useDashboardData(async ({ institutionId }) => {
    const [usersRes, apiKeysRes, auditRes, announcementsRes] = await Promise.all([
      supabase.from('ct_users').select('id, full_name, email, role, roles, institution_type, is_active, created_at').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_api_keys').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
      supabase.from('ct_audit_logs').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(30),
      supabase.from('ct_announcements').select('id, title, created_at').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(10),
    ]);
    return {
      users: usersRes.data ?? [],
      apiKeys: apiKeysRes.data ?? [],
      auditLogs: auditRes.data ?? [],
      announcements: announcementsRes.data ?? [],
    };
  }, { users: [], apiKeys: [], auditLogs: [], announcements: [] } as any, { requireInstitution: true });

  const filteredUsers = useMemo(() => data.users.filter((entry: any) => {
    const haystack = `${entry.full_name || ''} ${entry.email || ''} ${entry.role || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  }), [data.users, search]);

  const generateKey = async () => {
    if (!user?.id || !institutionId || !apiName.trim()) return;
    const material = createApiKeyMaterial();
    const { data: keyRecord } = await supabase.from('ct_api_keys').insert({
      institution_id: institutionId,
      created_by: user.id,
      name: apiName.trim(),
      key_hash: material.hash,
      key_prefix: material.prefix,
      scopes: ['read', 'write', 'events'],
      is_active: true,
    }).select('*').single();

    if (keyRecord) {
      setData((current: any) => ({ ...current, apiKeys: [keyRecord, ...current.apiKeys] }));
      setApiName('');
    }
  };

  const revokeKey = async (keyId: string) => {
    await supabase.from('ct_api_keys').update({ is_active: false }).eq('id', keyId);
    setData((current: any) => ({ ...current, apiKeys: current.apiKeys.map((entry: any) => entry.id === keyId ? { ...entry, is_active: false } : entry) }));
  };

  const logIntegrationReview = async (templateKey: string, templateName: string) => {
    if (!user?.id || !institutionId) return;
    const message = `Queued ${templateName} for institutional integration review.`;
    await supabase.from('ct_audit_logs').insert({
      institution_id: institutionId,
      actor_id: user.id,
      action: `integration.review.${templateKey}`,
      resource_type: 'integration',
      severity: 'info',
      metadata: { template: templateName },
    });
    setIntegrationMessage((current) => ({ ...current, [templateKey]: message }));
    setData((current: any) => ({ ...current, auditLogs: [{ id: crypto.randomUUID(), action: `integration.review.${templateKey}`, severity: 'info', created_at: new Date().toISOString(), metadata: { template: templateName } }, ...current.auditLogs] }));
  };

  return (
    <EmailVerificationGate>
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white relative">
          <div className="absolute top-4 right-4"><InstitutionRibbon /></div>
          <h1 className="font-lexend text-3xl font-900">IT Admin Workspace</h1>
          <p className="mt-2 text-white/80">Review users, govern API access, inspect audit activity, and prepare institutional integrations from a real admin console.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Institution users" value={data.users.length} color="primary" />
          <StatCard label="Live API keys" value={data.apiKeys.filter((entry: any) => entry.is_active).length} color="secondary" />
          <StatCard label="Audit events" value={data.auditLogs.length} color="tertiary" />
          <StatCard label="Announcements" value={data.announcements.length} color="primary" />
        </div>

        <div className="flex gap-2 overflow-x-auto rounded-[1rem] bg-surface p-1">
          {tabs.map((tab) => (
            <button
              key={tab.hash}
              onClick={() => {
                setActiveTab(tab.label);
                window.history.replaceState({}, '', `${window.location.pathname}#${tab.hash}`);
                const el = document.getElementById(tab.hash);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`rounded-[0.85rem] px-4 py-2 text-sm font-jakarta font-700 whitespace-nowrap ${activeTab === tab.label ? 'bg-surface-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'Users' && (
          <Card id="users" className="scroll-mt-24">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="font-lexend text-lg font-800 text-on-surface">Institution users</h2>
              <div className="w-full md:w-80">
                <Input label="Search users" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or role" />
              </div>
            </div>
            <div className="space-y-3">
              {filteredUsers.length === 0 ? <p className="text-sm text-on-surface-variant">No users found for this search.</p> : filteredUsers.map((entry: any) => (
                <div key={entry.id} className="rounded-[1rem] bg-surface p-4 flex flex-col gap-3">
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-jakarta font-700 text-on-surface">{entry.full_name || entry.email}</p>
                      <p className="text-sm text-on-surface-variant">{entry.email} · {entry.institution_type || 'platform pending'}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(entry.roles || [entry.role]).filter(Boolean).map((r: string) => (
                          <span key={r} className="inline-block bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{r}</span>
                        ))}
                      </div>
                    </div>
                    <Badge label={entry.is_active === false ? 'inactive' : 'active'} variant={entry.is_active === false ? 'neutral' : 'tertiary'} />
                  </div>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <select
                      value={editingRole[entry.id] ?? entry.role ?? 'student'}
                      onChange={(e) => setEditingRole((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                      className="rounded-xl border border-outline-variant bg-surface-lowest px-3 py-2 text-sm"
                    >
                      {ALL_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <label className="flex items-center gap-2 text-sm font-jakarta font-700 text-on-surface cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingAthlete[entry.id] ?? (entry.roles || []).includes('athlete')}
                        onChange={(e) => setEditingAthlete((prev) => ({ ...prev, [entry.id]: e.target.checked }))}
                        className="rounded"
                      />
                      Also athlete
                    </label>
                    <Button size="sm" className="rounded-full" onClick={() => saveUserRole(entry.id, entry.roles)}>Save</Button>
                    {roleFlash[entry.id] && <span className="text-sm text-primary">{roleFlash[entry.id]}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'API Keys' && (
          <div id="api-keys" className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6 scroll-mt-24">
            <Card>
              <h2 className="font-lexend text-lg font-800 text-on-surface">Generate API key</h2>
              <p className="mt-2 text-sm text-on-surface-variant">Create scoped institutional keys for SIS, LMS, warehouse, and webhook consumers.</p>
              <div className="mt-4 space-y-3">
                <Input label="Key name" value={apiName} onChange={(e) => setApiName(e.target.value)} placeholder="Brightspace integration" />
                <Button onClick={generateKey} className="w-full rounded-full">Generate key</Button>
              </div>
            </Card>
            <Card>
              <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Issued keys</h2>
              <div className="space-y-3">
                {data.apiKeys.length === 0 ? <p className="text-sm text-on-surface-variant">No API keys yet. Generate the first one for your integration team.</p> : data.apiKeys.map((entry: any) => (
                  <div key={entry.id} className="rounded-[1rem] bg-surface p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-jakarta font-700 text-on-surface">{entry.name}</p>
                      <p className="text-sm text-on-surface-variant">Prefix: {entry.key_prefix} · Scopes: {(entry.scopes || []).join(', ') || 'read'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge label={entry.is_active ? 'active' : 'revoked'} variant={entry.is_active ? 'tertiary' : 'neutral'} />
                      {entry.is_active && <Button onClick={() => revokeKey(entry.id)} variant="outline" className="rounded-full">Revoke</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'API Docs' && (
          <div id="api-docs" className="grid xl:grid-cols-2 gap-6 scroll-mt-24">
            {apiReference.map((category) => (
              <Card key={category.id}>
                <p className="font-label text-xs font-bold uppercase tracking-[0.14em] text-primary">{category.audience}</p>
                <h2 className="mt-2 font-lexend text-xl font-800 text-on-surface">{category.title}</h2>
                <p className="mt-2 text-sm text-on-surface-variant">{category.summary}</p>
                <div className="mt-4 space-y-3">
                  {category.endpoints.map((endpoint) => (
                    <div key={`${category.id}-${endpoint.path}`} className="rounded-[1rem] bg-surface p-4">
                      <div className="mb-2 flex items-center gap-3">
                        <Badge label={endpoint.method} variant={endpoint.method === 'GET' ? 'tertiary' : endpoint.method === 'POST' ? 'primary' : endpoint.method === 'PUT' ? 'secondary' : 'danger'} />
                        <code className="text-xs text-on-surface">{endpoint.path}</code>
                      </div>
                      <p className="text-sm text-on-surface-variant">{endpoint.description}</p>
                      <p className="mt-2 text-xs text-on-surface-variant">Scope: {endpoint.scope}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'Audit Log' && (
          <Card id="audit" className="scroll-mt-24">
            <h2 className="mb-4 font-lexend text-lg font-800 text-on-surface">Audit log</h2>
            <div className="space-y-3">
              {data.auditLogs.length === 0 ? <p className="text-sm text-on-surface-variant">No audit entries yet.</p> : data.auditLogs.map((entry: any) => (
                <div key={entry.id} className="rounded-[1rem] bg-surface p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">{entry.action}</p>
                    <p className="text-sm text-on-surface-variant">{entry.created_at ? new Date(entry.created_at).toLocaleString() : 'Just now'}</p>
                  </div>
                  <Badge label={entry.severity || 'info'} variant={entry.severity === 'critical' || entry.severity === 'error' ? 'danger' : entry.severity === 'warning' ? 'secondary' : 'tertiary'} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'Integrations' && (
          <div id="integrations" className="space-y-6 scroll-mt-24">
            {/* Canvas LMS */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-lexend text-lg font-800 text-on-surface">Canvas LMS</p>
                  <p className="text-sm text-on-surface-variant">Roster, course, and engagement sync via Canvas REST API</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-jakarta font-700 ${testResult.canvas?.ok ? 'bg-tertiary-container text-tertiary' : 'bg-surface-low text-on-surface-variant'}`}>
                  {testResult.canvas?.ok ? 'Connected' : 'Not configured'}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Input label="Canvas API Token" type="password" value={lmsConfigs.canvas.apiKey} onChange={e => setLmsConfigs(c => ({ ...c, canvas: { ...c.canvas, apiKey: e.target.value } }))} placeholder="Your Canvas API token" />
                <Input label="Canvas Base URL" value={lmsConfigs.canvas.baseUrl} onChange={e => setLmsConfigs(c => ({ ...c, canvas: { ...c.canvas, baseUrl: e.target.value } }))} placeholder="https://canvas.instructure.com" />
              </div>
              {testResult.canvas && <p className={`text-sm mb-3 ${testResult.canvas.ok ? 'text-tertiary' : 'text-red-500'}`}>{testResult.canvas.msg}</p>}
              {integrationMessage.canvas && <p className="text-xs text-tertiary mb-2">{integrationMessage.canvas}</p>}
              <div className="flex gap-3">
                <Button onClick={() => testLmsConnection('canvas')} disabled={testingLms === 'canvas'} variant="outline" className="rounded-full">{testingLms === 'canvas' ? 'Testing...' : 'Test Connection'}</Button>
                <Button onClick={() => saveLmsConfig('canvas')} className="rounded-full">Save Config</Button>
              </div>
            </Card>

            {/* Moodle */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-lexend text-lg font-800 text-on-surface">Moodle LMS</p>
                  <p className="text-sm text-on-surface-variant">Course, enrollment, and grade sync via Moodle Web Services</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-jakarta font-700 ${testResult.moodle?.ok ? 'bg-tertiary-container text-tertiary' : 'bg-surface-low text-on-surface-variant'}`}>
                  {testResult.moodle?.ok ? 'Connected' : 'Not configured'}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <Input label="Moodle Web Services Token" type="password" value={lmsConfigs.moodle.apiKey} onChange={e => setLmsConfigs(c => ({ ...c, moodle: { ...c.moodle, apiKey: e.target.value } }))} placeholder="Your Moodle token" />
                <Input label="Moodle Base URL" value={lmsConfigs.moodle.baseUrl} onChange={e => setLmsConfigs(c => ({ ...c, moodle: { ...c.moodle, baseUrl: e.target.value } }))} placeholder="https://yoursite.moodlecloud.com" />
              </div>
              {testResult.moodle && <p className={`text-sm mb-3 ${testResult.moodle.ok ? 'text-tertiary' : 'text-red-500'}`}>{testResult.moodle.msg}</p>}
              {integrationMessage.moodle && <p className="text-xs text-tertiary mb-2">{integrationMessage.moodle}</p>}
              <div className="flex gap-3">
                <Button onClick={() => testLmsConnection('moodle')} disabled={testingLms === 'moodle'} variant="outline" className="rounded-full">{testingLms === 'moodle' ? 'Testing...' : 'Test Connection'}</Button>
                <Button onClick={() => saveLmsConfig('moodle')} className="rounded-full">Save Config</Button>
              </div>
            </Card>

            {/* Minerva */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-lexend text-lg font-800 text-on-surface">Minerva</p>
                  <p className="text-sm text-on-surface-variant">Enterprise-grade SIS integration with Minerva</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-jakarta font-700">Enterprise</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-4">Minerva integration is available on Enterprise plans. Contact our team to set up a custom sync pipeline.</p>
              <Button variant="outline" className="rounded-full" onClick={() => window.open('mailto:enterprise@wevsocial.com?subject=Minerva Integration')}>Contact for Enterprise Access</Button>
            </Card>

            {/* Other integrations */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {integrationTemplates.filter(t => !['canvas','moodle'].includes(t.key)).map((template) => (
                <Card key={template.key}>
                  <p className="font-lexend text-lg font-800 text-on-surface">{template.name}</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">{template.description}</p>
                  <Button onClick={() => logIntegrationReview(template.key, template.name)} className="mt-4 w-full rounded-full">Queue integration review</Button>
                  {integrationMessage[template.key] && <p className="mt-3 text-xs text-tertiary">{integrationMessage[template.key]}</p>}
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Billing' && (
          <div id="billing" className="space-y-6">
            <BillingSection isAdmin={false} />
          </div>
        )}

        {activeTab === 'Settings' && (
          <div id="settings" className="space-y-6">
            <Card>
              <h2 className="font-lexend text-lg font-800 text-on-surface mb-4">Profile</h2>
              {user?.id && <ProfilePhotoUpload userId={user.id} currentUrl={undefined} displayName={user.email} />}
              <div className="mt-6">
                {user?.id && <NotificationPrefsPanel userId={user.id} institutionId={institutionId} role="staff" />}
              </div>
            </Card>
            <Card>
              <h2 className="font-lexend text-lg font-800 text-on-surface mb-4">Platform Settings</h2>
              <div className="space-y-4">
                <div className="rounded-[1rem] bg-surface p-4 flex items-center justify-between">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">Email confirmations</p>
                    <p className="text-sm text-on-surface-variant">Auto-confirm new signups; users can log in immediately</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-tertiary-container text-tertiary text-xs font-jakarta font-700">Enabled</span>
                </div>
                <div className="rounded-[1rem] bg-surface p-4 flex items-center justify-between">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">Google OAuth</p>
                    <p className="text-sm text-on-surface-variant">Google sign-in via Supabase OAuth redirect</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-tertiary-container text-tertiary text-xs font-jakarta font-700">Active</span>
                </div>
                <div className="rounded-[1rem] bg-surface p-4 flex items-center justify-between">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">Row Level Security</p>
                    <p className="text-sm text-on-surface-variant">RLS enabled on ct_users, ct_notifications, ct_survey_responses</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-tertiary-container text-tertiary text-xs font-jakarta font-700">On</span>
                </div>
              </div>
            </Card>
            <Card>
              <h2 className="font-lexend text-lg font-800 text-on-surface mb-4">Institution Info</h2>
              <div className="space-y-3">
                <div className="rounded-[1rem] bg-surface p-4">
                  <p className="text-xs font-jakarta font-700 text-on-surface-variant uppercase tracking-widest mb-1">Institution ID</p>
                  <code className="text-sm text-on-surface font-mono break-all">{institutionId || 'Loading...'}</code>
                </div>
                <div className="rounded-[1rem] bg-surface p-4">
                  <p className="text-xs font-jakarta font-700 text-on-surface-variant uppercase tracking-widest mb-1">Supabase Project</p>
                  <code className="text-sm text-on-surface">ncftkuuxfllyohixiusb.supabase.co</code>
                </div>
                <div className="rounded-[1rem] bg-surface p-4">
                  <p className="text-xs font-jakarta font-700 text-on-surface-variant uppercase tracking-widest mb-1">Users in system</p>
                  <p className="text-2xl font-lexend font-900 text-primary">{data.users.length}</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
    </EmailVerificationGate>
  );
}
