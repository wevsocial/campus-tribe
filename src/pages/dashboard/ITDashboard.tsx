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

const tabs = [
  { label: 'Users', hash: 'users' },
  { label: 'API Keys', hash: 'api-keys' },
  { label: 'API Docs', hash: 'api-docs' },
  { label: 'Audit Log', hash: 'audit' },
  { label: 'Integrations', hash: 'integrations' },
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
  const [integrationMessage, setIntegrationMessage] = useState<Record<string, string>>({});

  const { data, setData } = useDashboardData(async ({ institutionId }) => {
    const [usersRes, apiKeysRes, auditRes, announcementsRes] = await Promise.all([
      supabase.from('ct_users').select('id, full_name, email, role, institution_type, is_active, created_at').eq('institution_id', institutionId).order('created_at', { ascending: false }),
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
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-[1.5rem] bg-primary p-8 text-white">
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
          <Card>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="font-lexend text-lg font-800 text-on-surface">Institution users</h2>
              <div className="w-full md:w-80">
                <Input label="Search users" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or role" />
              </div>
            </div>
            <div className="space-y-3">
              {filteredUsers.length === 0 ? <p className="text-sm text-on-surface-variant">No users found for this search.</p> : filteredUsers.map((entry: any) => (
                <div key={entry.id} className="rounded-[1rem] bg-surface p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">{entry.full_name || entry.email}</p>
                    <p className="text-sm text-on-surface-variant">{entry.email} · {entry.role} · {entry.institution_type || 'platform pending'}</p>
                  </div>
                  <Badge label={entry.is_active === false ? 'inactive' : 'active'} variant={entry.is_active === false ? 'neutral' : 'tertiary'} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'API Keys' && (
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
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
          <div className="grid xl:grid-cols-2 gap-6">
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
          <Card>
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
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {integrationTemplates.map((template) => (
              <Card key={template.key}>
                <p className="font-lexend text-lg font-800 text-on-surface">{template.name}</p>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">{template.description}</p>
                <Button onClick={() => logIntegrationReview(template.key, template.name)} className="mt-4 w-full rounded-full">Queue integration review</Button>
                {integrationMessage[template.key] && <p className="mt-3 text-xs text-tertiary">{integrationMessage[template.key]}</p>}
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'Settings' && (
          <div id="settings" className="space-y-6">
            <Card>
              <h2 className="font-lexend text-lg font-800 text-on-surface mb-4">Platform Settings</h2>
              <div className="space-y-4">
                <div className="rounded-[1rem] bg-surface p-4 flex items-center justify-between">
                  <div>
                    <p className="font-jakarta font-700 text-on-surface">Email confirmations</p>
                    <p className="text-sm text-on-surface-variant">Auto-confirm new signups — users can log in immediately</p>
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
  );
}
