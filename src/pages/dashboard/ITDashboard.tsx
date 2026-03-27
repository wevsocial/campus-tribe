import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Search, CheckCircle, XCircle, Copy, RefreshCw, Trash2 } from 'lucide-react';

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

const apiDocCategories = ['Authentication', 'Students', 'Events', 'Clubs', 'Analytics', 'Webhooks'];

const apiDocEntries: Record<string, { method: string; endpoint: string; description: string; example: string }[]> = {
  Authentication: [
    { method: 'POST', endpoint: '/auth/login', description: 'Authenticate a user and receive a JWT access token.', example: '{\n  "email": "user@campus.edu",\n  "password": "secret"\n}' },
    { method: 'POST', endpoint: '/auth/refresh', description: 'Refresh an expired access token using a refresh token.', example: '{\n  "refresh_token": "rt_abc123"\n}' },
    { method: 'POST', endpoint: '/auth/logout', description: 'Invalidate the current session and revoke tokens.', example: '{}' },
  ],
  Students: [
    { method: 'GET', endpoint: '/students', description: 'List all students in the institution. Supports pagination.', example: '[\n  { "id": "uuid", "name": "Alex Kim", "role": "student" }\n]' },
    { method: 'GET', endpoint: '/students/:id', description: 'Retrieve a single student record by ID.', example: '{ "id": "uuid", "name": "Alex Kim", "email": "alex@campus.edu" }' },
    { method: 'PUT', endpoint: '/students/:id', description: 'Update a student record (admin only).', example: '{ "status": "active", "department": "CS" }' },
  ],
  Events: [
    { method: 'GET', endpoint: '/events', description: 'List all events for the institution.', example: '[{ "id": "uuid", "title": "Spring Gala", "status": "upcoming" }]' },
    { method: 'POST', endpoint: '/events', description: 'Create a new event.', example: '{ "title": "Hackathon", "start": "2026-04-10T09:00:00Z" }' },
  ],
  Clubs: [
    { method: 'GET', endpoint: '/clubs', description: 'List all registered clubs.', example: '[{ "id": "uuid", "name": "Robotics Club", "memberCount": 98 }]' },
    { method: 'POST', endpoint: '/clubs/:id/members', description: 'Add a member to a club.', example: '{ "userId": "uuid" }' },
  ],
  Analytics: [
    { method: 'GET', endpoint: '/analytics/overview', description: 'Retrieve platform-wide engagement metrics.', example: '{ "activeStudents": 67200, "totalEvents": 38 }' },
    { method: 'GET', endpoint: '/analytics/clubs/:id', description: 'Get engagement analytics for a specific club.', example: '{ "members": 142, "avgAttendance": 87 }' },
  ],
  Webhooks: [
    { method: 'POST', endpoint: '/webhooks', description: 'Register a new webhook endpoint.', example: '{ "url": "https://your.app/hook", "events": ["user.signup"] }' },
    { method: 'DELETE', endpoint: '/webhooks/:id', description: 'Remove a registered webhook.', example: '{}' },
  ],
};

const extendedApiKeys = [
  { id: 1, name: 'LMS Integration - Brightspace', prefix: 'ct_live_xK9', created: '2026-02-01', lastUsed: '1h ago', permissions: 'read, write', status: 'active' },
  { id: 2, name: 'HRIS Connector - Workday', prefix: 'ct_live_aB7', created: '2026-01-15', lastUsed: '3d ago', permissions: 'read', status: 'active' },
  { id: 3, name: 'Mobile App SDK', prefix: 'ct_live_mX3', created: '2026-03-01', lastUsed: '20m ago', permissions: 'read, write, events', status: 'active' },
  { id: 4, name: 'Analytics Export', prefix: 'ct_live_qW5', created: '2025-11-20', lastUsed: '30d ago', permissions: 'read', status: 'inactive' },
];

const extendedIntegrations = [
  { name: 'Google Workspace', desc: 'SSO, Calendar, Drive integration', color: '#4285F4', status: true },
  { name: 'Microsoft 365', desc: 'Teams, OneDrive, SSO', color: '#00A4EF', status: true },
  { name: 'Zoom', desc: 'Auto-create meeting links for events', color: '#2D8CFF', status: false },
  { name: 'Slack', desc: 'Channel notifications and alerts', color: '#4A154B', status: false },
  { name: 'Canvas LMS', desc: 'Grade sync and course import', color: '#E66000', status: true },
  { name: 'Blackboard', desc: 'Legacy LMS integration', color: '#CF0A2C', status: false },
  { name: 'Banner SIS', desc: 'Student information system sync', color: '#0066CC', status: true },
  { name: 'Ellucian', desc: 'ERP connector for HR and finance', color: '#6D2E91', status: false },
];

const responseTimeData = [
  { time: '00:00', ms: 38 }, { time: '04:00', ms: 22 }, { time: '08:00', ms: 55 },
  { time: '12:00', ms: 72 }, { time: '16:00', ms: 68 }, { time: '20:00', ms: 45 }, { time: '23:59', ms: 41 },
];

const tabs = ['User Management', 'RBAC', 'API Keys', 'API Docs', 'Integrations', 'System Health', 'Audit Log', 'SSO Config'];

export default function ITDashboard() {
  const [activeTab, setActiveTab] = useState('User Management');
  const [search, setSearch] = useState('');
  const [activeApiDocCategory, setActiveApiDocCategory] = useState('Authentication');
  const [extIntegrationStates, setExtIntegrationStates] = useState<Record<string, boolean>>(
    Object.fromEntries(extendedIntegrations.map(i => [i.name, i.status]))
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
          src="/assets/campus-university.jpg"
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
          <Card padding="none" className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Key Name', 'Prefix', 'Created', 'Last Used', 'Permissions', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-medium text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {extendedApiKeys.map((k, i) => (
                  <tr key={k.id} className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{k.name}</td>
                    <td className="py-3 px-4"><code className="text-xs bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-600">{k.prefix}...</code></td>
                    <td className="py-3 px-4 text-xs text-gray-500">{k.created}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{k.lastUsed}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{k.permissions}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${k.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{k.status}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#0047AB] hover:bg-blue-50 transition-colors" title="Copy"><Copy size={13} /></button>
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors" title="Regenerate"><RefreshCw size={13} /></button>
                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Revoke"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* API Docs */}
      {activeTab === 'API Docs' && (
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">API Reference</h3>
              <div className="space-y-1">
                {apiDocCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveApiDocCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeApiDocCategory === cat ? 'bg-[#0047AB] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </Card>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-semibold text-gray-900 text-lg">{activeApiDocCategory} API</h2>
            {(apiDocEntries[activeApiDocCategory] || []).map((entry, i) => (
              <Card key={i}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${entry.method === 'GET' ? 'bg-green-100 text-green-700' : entry.method === 'POST' ? 'bg-blue-100 text-blue-700' : entry.method === 'PUT' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                    {entry.method}
                  </span>
                  <code className="text-sm font-mono text-gray-800">{entry.endpoint}</code>
                </div>
                <p className="text-sm text-gray-600 mb-3">{entry.description}</p>
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-green-400 whitespace-pre">{entry.example}</pre>
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
            {extendedIntegrations.map(int => (
              <Card key={int.name}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: int.color }}>
                    {int.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm">{int.name}</div>
                    <div className="text-xs text-gray-400">{int.desc}</div>
                  </div>
                  <button
                    onClick={() => setExtIntegrationStates(prev => ({ ...prev, [int.name]: !prev[int.name] }))}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${extIntegrationStates[int.name] ? 'bg-[#00A86B]' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${extIntegrationStates[int.name] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs font-medium ${extIntegrationStates[int.name] ? 'text-green-600' : 'text-gray-400'}`}>
                    {extIntegrationStates[int.name] ? 'Connected' : 'Not Connected'}
                  </span>
                  <button className="text-xs text-[#0047AB] hover:underline">Configure</button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* System Health */}
      {activeTab === 'System Health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Uptime', value: '99.97%', color: '#00A86B' },
              { label: 'Avg Response', value: '48ms', color: '#0047AB' },
              { label: 'Error Rate', value: '0.03%', color: '#FF7F50' },
              { label: 'Storage Used', value: '61%', color: '#7B2D8B' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-black/5 shadow-sm p-5 text-center">
                <div className="text-2xl font-lexend font-extrabold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Response Time (Last 24h)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} unit="ms" />
                <Tooltip formatter={(val: any) => [`${val}ms`, 'Response Time']} />
                <Line type="monotone" dataKey="ms" stroke="#0047AB" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Service Status</h3>
            <div className="space-y-3">
              {services.map(svc => (
                <div key={svc.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${svc.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="font-medium text-gray-900 text-sm">{svc.name}</span>
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
          </Card>
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Storage Usage</h3>
            <div className="space-y-3">
              {[
                { label: 'Media Files', used: 78, total: '500 GB' },
                { label: 'Database', used: 45, total: '200 GB' },
                { label: 'Logs', used: 32, total: '100 GB' },
                { label: 'Backups', used: 61, total: '1 TB' },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{s.label}</span>
                    <span className="text-gray-400">{s.used}% of {s.total}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 rounded-full bg-[#0047AB]" style={{ width: `${s.used}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
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
