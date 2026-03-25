import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Search, CheckCircle, XCircle } from 'lucide-react';

const users = [
  { id: 1, name: 'Dr. Sarah Patel', email: 'admin@demo.com', role: 'admin', department: 'Admin', status: 'active', lastLogin: '2h ago' },
  { id: 2, name: 'Alex Kim', email: 'student@demo.com', role: 'student', department: 'Computer Science', status: 'active', lastLogin: '10m ago' },
  { id: 3, name: 'Marcus Thompson', email: 'coach@demo.com', role: 'coach', department: 'Athletics', status: 'active', lastLogin: '1d ago' },
  { id: 4, name: 'Priya Sharma', email: 'club@demo.com', role: 'club_leader', department: 'Student Life', status: 'active', lastLogin: '3h ago' },
  { id: 5, name: 'James Crawford', email: 'james.c@demo.com', role: 'teacher', department: 'Engineering', status: 'active', lastLogin: '30m ago' },
  { id: 6, name: 'Anika Reeves', email: 'anika.r@demo.com', role: 'student', department: 'Arts', status: 'suspended', lastLogin: '5d ago' },
  { id: 7, name: 'Leon Okafor', email: 'leon.o@demo.com', role: 'it_director', department: 'IT', status: 'active', lastLogin: '15m ago' },
  { id: 8, name: 'Mei Zhang', email: 'mei.z@demo.com', role: 'student', department: 'Biology', status: 'active', lastLogin: '2d ago' },
];

const auditLogs = [
  { id: 1, action: 'User login', actor: 'admin@demo.com', ip: '142.250.80.46', time: '2026-03-24 13:05:22', severity: 'info' },
  { id: 2, action: 'Role updated: student -> club_leader', actor: 'it@demo.com', ip: '192.168.1.5', time: '2026-03-24 12:48:11', severity: 'warning' },
  { id: 3, action: 'API key generated', actor: 'dev@demo.com', ip: '10.0.0.2', time: '2026-03-24 11:30:00', severity: 'info' },
  { id: 4, action: 'Failed login attempt (3x)', actor: 'unknown@demo.com', ip: '198.51.100.4', time: '2026-03-24 10:15:44', severity: 'error' },
  { id: 5, action: 'User suspended', actor: 'admin@demo.com', ip: '142.250.80.46', time: '2026-03-23 16:22:00', severity: 'warning' },
  { id: 6, action: 'SSO config updated', actor: 'it@demo.com', ip: '192.168.1.5', time: '2026-03-23 14:05:00', severity: 'info' },
  { id: 7, action: 'Password reset', actor: 'mei.z@demo.com', ip: '172.16.0.8', time: '2026-03-23 09:10:00', severity: 'info' },
];

const apiKeys = [
  { id: 1, name: 'LMS Integration - Brightspace', key: 'ct_live_xK9...2mPQ', created: '2026-02-01', lastUsed: '1h ago', status: 'active' },
  { id: 2, name: 'HRIS Connector - Workday', key: 'ct_live_aB7...9nRZ', created: '2026-01-15', lastUsed: '3d ago', status: 'active' },
  { id: 3, name: 'Mobile App SDK', key: 'ct_live_mX3...7kLT', created: '2026-03-01', lastUsed: '20m ago', status: 'active' },
  { id: 4, name: 'Analytics Export', key: 'ct_live_qW5...4vSH', created: '2025-11-20', lastUsed: '30d ago', status: 'inactive' },
];

const integrations = [
  { name: 'Google Workspace', desc: 'SSO, Calendar, Drive integration', icon: '🔵', enabled: true },
  { name: 'Microsoft 365', desc: 'Teams, OneDrive, SSO', icon: '🔷', enabled: true },
  { name: 'Zoom', desc: 'Auto-create meeting links for events', icon: '📹', enabled: false },
  { name: 'Brightspace (D2L)', desc: 'LMS grade sync and course import', icon: '📚', enabled: true },
  { name: 'Workday', desc: 'HRIS staff and student sync', icon: '🏢', enabled: false },
  { name: 'Stripe', desc: 'Payments for events and memberships', icon: '💳', enabled: true },
];

const services = [
  { name: 'API Gateway', status: 'operational', uptime: '99.98%', latency: '42ms' },
  { name: 'Authentication Service', status: 'operational', uptime: '100%', latency: '18ms' },
  { name: 'Database (Primary)', status: 'operational', uptime: '99.97%', latency: '8ms' },
  { name: 'File Storage (CDN)', status: 'operational', uptime: '99.99%', latency: '65ms' },
  { name: 'Email Service', status: 'degraded', uptime: '98.2%', latency: '210ms' },
  { name: 'Push Notifications', status: 'operational', uptime: '99.9%', latency: '31ms' },
];

const rbacRoles = [
  { role: 'Student', canView: true, canCreate: false, canEdit: false, canDelete: false, canAdmin: false },
  { role: 'Teacher', canView: true, canCreate: true, canEdit: true, canDelete: false, canAdmin: false },
  { role: 'Coach', canView: true, canCreate: true, canEdit: true, canDelete: false, canAdmin: false },
  { role: 'Club Leader', canView: true, canCreate: true, canEdit: true, canDelete: false, canAdmin: false },
  { role: 'Admin/Dean', canView: true, canCreate: true, canEdit: true, canDelete: true, canAdmin: false },
  { role: 'IT Director', canView: true, canCreate: true, canEdit: true, canDelete: true, canAdmin: true },
];

const tabs = ['User Management', 'RBAC', 'API Keys', 'Integrations', 'System Health', 'Audit Log', 'SSO Config'];

export default function ITDashboard() {
  const [activeTab, setActiveTab] = useState('User Management');
  const [search, setSearch] = useState('');
  const [integrationStates, setIntegrationStates] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map((i) => [i.name, i.enabled]))
  );

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8" style={{ height: 180 }}>
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&auto=format"
          alt="IT"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-800/70 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center px-8">
          <h1 className="font-bold text-3xl text-white mb-1" style={{ fontFamily: 'Lexend, sans-serif' }}>IT Administration</h1>
          <p className="text-gray-300 text-sm">System management, security, and integrations.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
              <div className="text-3xl font-lexend font-extrabold text-gray-900">4,291</div>
              <div className="mt-1 text-sm text-gray-500">Total Users</div>
            </div>
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
              <div className="text-3xl font-lexend font-extrabold text-gray-900">7</div>
              <div className="mt-1 text-sm text-gray-500">Security Events</div>
            </div>
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
              <div className="text-3xl font-lexend font-extrabold text-gray-900">4</div>
              <div className="mt-1 text-sm text-gray-500">API Keys</div>
            </div>
        <div className="bg-white rounded-xl border border-black/5 shadow-sm p-5">
              <div className="text-3xl font-lexend font-extrabold text-gray-900">99.8%</div>
              <div className="mt-1 text-sm text-gray-500">System Uptime</div>
            </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto bg-gray-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? 'bg-white text-[#0047AB] shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* User Management */}
      {activeTab === 'User Management' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-[#0047AB]"
              />
            </div>
            <Button variant="primary" size="sm" icon={<Plus size={14} />}>Add User</Button>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="text-left py-3 font-medium">User</th>
                    <th className="text-left py-3 font-medium">Role</th>
                    <th className="text-left py-3 font-medium">Department</th>
                    <th className="text-left py-3 font-medium">Status</th>
                    <th className="text-left py-3 font-medium">Last Login</th>
                    <th className="text-left py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center font-medium text-[#0047AB] text-xs">{u.name[0]}</div>
                          <div>
                            <div className="font-medium text-gray-900">{u.name}</div>
                            <div className="text-gray-400 text-xs">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">{u.role.replace('_', ' ')}</span>
                      </td>
                      <td className="py-3 text-gray-600">{u.department}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>{u.status}</span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">{u.lastLogin}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <button className="text-xs text-[#0047AB] hover:underline px-2 py-1 rounded-lg hover:bg-blue-50">Edit</button>
                          <button className={`text-xs px-2 py-1 rounded-lg ${u.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                            {u.status === 'active' ? 'Suspend' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* RBAC */}
      {activeTab === 'RBAC' && (
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Role-Based Access Control</h2>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="text-left py-3 font-medium">Role</th>
                    {['View Content', 'Create', 'Edit', 'Delete', 'Admin Panel'].map((p) => (
                      <th key={p} className="text-center py-3 font-medium">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rbacRoles.map((r) => (
                    <tr key={r.role} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 font-medium text-gray-800">{r.role}</td>
                      {[r.canView, r.canCreate, r.canEdit, r.canDelete, r.canAdmin].map((can, i) => (
                        <td key={i} className="py-3 text-center">
                          {can ? <CheckCircle size={18} className="text-green-500 mx-auto" /> : <XCircle size={18} className="text-gray-200 mx-auto" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm">Edit Permissions</Button>
            </div>
          </Card>
        </div>
      )}

      {/* API Keys */}
      {activeTab === 'API Keys' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900 text-lg">API Keys</h2>
            <Button variant="primary" size="sm" icon={<Plus size={14} />}>Generate New Key</Button>
          </div>
          <div className="space-y-4">
            {apiKeys.map((k) => (
              <Card key={k.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{k.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-600">{k.key}</code>
                      <button className="text-xs text-[#0047AB] hover:underline">Copy</button>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Created {k.created} | Last used {k.lastUsed}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${k.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{k.status}</span>
                    <button className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg">Revoke</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Integrations */}
      {activeTab === 'Integrations' && (
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Third-Party Integrations</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {integrations.map((int) => (
              <Card key={int.name}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{int.icon}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{int.name}</div>
                      <div className="text-sm text-gray-400">{int.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIntegrationStates(prev => ({ ...prev, [int.name]: !prev[int.name] }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${integrationStates[int.name] ? 'bg-[#00A86B]' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${integrationStates[int.name] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                {integrationStates[int.name] && (
                  <div className="mt-3 flex gap-2">
                    <button className="text-xs text-[#0047AB] hover:underline">Configure</button>
                    <button className="text-xs text-gray-400 hover:underline">View Docs</button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* System Health */}
      {activeTab === 'System Health' && (
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">System Health</h2>
          <div className="space-y-3">
            {services.map((svc) => (
              <div key={svc.name} className="bg-white rounded-xl p-4 border border-black/5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${svc.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div>
                    <div className="font-medium text-gray-900">{svc.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{svc.status}</div>
                  </div>
                </div>
                <div className="flex gap-8 text-sm text-right">
                  <div>
                    <div className="font-semibold text-gray-900">{svc.uptime}</div>
                    <div className="text-gray-400 text-xs">Uptime</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{svc.latency}</div>
                    <div className="text-gray-400 text-xs">Latency</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log */}
      {activeTab === 'Audit Log' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search audit logs..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-[#0047AB]" />
            </div>
            <Button variant="outline" size="sm">Export CSV</Button>
          </div>
          <Card>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    log.severity === 'error' ? 'bg-red-500' :
                    log.severity === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{log.action}</div>
                    <div className="text-xs text-gray-400">{log.actor} | {log.ip}</div>
                  </div>
                  <div className="text-xs text-gray-400">{log.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* SSO Config */}
      {activeTab === 'SSO Config' && (
        <div>
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Single Sign-On Configuration</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { provider: 'Google Workspace', desc: 'OIDC via Google Cloud', status: 'Connected', color: 'green' },
              { provider: 'Microsoft Azure AD', desc: 'SAML 2.0 / OIDC', status: 'Connected', color: 'green' },
              { provider: 'SAML 2.0 Custom', desc: 'Generic SAML provider', status: 'Not configured', color: 'gray' },
              { provider: 'LDAP / Active Directory', desc: 'On-premise directory', status: 'Not configured', color: 'gray' },
            ].map((p) => (
              <Card key={p.provider}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{p.provider}</div>
                    <div className="text-sm text-gray-400">{p.desc}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.color === 'green' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{p.status}</span>
                </div>
                <Button variant={p.status === 'Connected' ? 'outline' : 'primary'} size="sm">
                  {p.status === 'Connected' ? 'Reconfigure' : 'Set Up'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
