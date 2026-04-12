import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, CreditCard, BarChart2,
  Search, LogOut, Shield, Eye, Loader2, CheckCircle2, AlertCircle,
  ChevronRight, TrendingUp, Globe, Activity, Settings, Bell,
  RefreshCw, ArrowUpRight, UserCheck, DollarSign, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import CampusTribeLogo from '../components/ui/CampusTribeLogo';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

interface Institution {
  id: string;
  name: string;
  institution_name?: string; // from analytics view
  institution_type: string;
  subscription_status: string;
  created_at: string;
  total_users?: number;
  students?: number;
  paid_users?: number;
  total_revenue?: number | string;
  last_payment_at?: string;
}

interface PlatformStats {
  total_institutions: number;
  total_users: number;
  total_students: number;
  total_paid_users: number;
  total_revenue: number;
  active_subscriptions: number;
  trial_subscriptions: number;
}

interface StealthSession {
  id: string;
  superadmin_id: string;
  target_institution_id?: string;
  target_role?: string;
  started_at: string;
  ended_at?: string;
  notes?: string;
}

const SUPERADMIN_EMAILS = [
  'mrxxxbond@gmail.com', 'mrxxxbong@gmail.com', 'siinamits@gmail.com',
  'sdescha21@gmail.com', 'wevsocial.s@gmail.com', 'amitt.k.sin@gmail.com', 'javbollad@gmail.com',
];

export default function SuperAdminPortal() {
  const { user, signOut, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'institutions' | 'users' | 'billing' | 'stealth' | 'analytics' | 'alerts' | 'settings'>(() => {
    try { return (localStorage.getItem('ct_tab_superadmin') as any) || 'overview'; } catch { return 'overview'; }
  });
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [stealthSessions, setStealthSessions] = useState<StealthSession[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allInvoices, setAllInvoices] = useState<any[]>([]);
  const [errorAlerts, setErrorAlerts] = useState<{ date: string; errors: number; warnings: number }[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [alertLevelFilter, setAlertLevelFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [userGrowth, setUserGrowth] = useState<{ date: string; count: number }[]>([]);
  const [roleDist, setRoleDist] = useState<{ role: string; count: number }[]>([]);
  const [topInstitutions, setTopInstitutions] = useState<{ name: string; count: number }[]>([]);
  const [usageSummary, setUsageSummary] = useState<{ events:number; clubs:number; leagues:number; challenges:number; surveys:number }>({ events:0, clubs:0, leagues:0, challenges:0, surveys:0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [stealthTarget, setStealthTarget] = useState<{ institution: Institution | null; role: string; userId?: string } | null>(null);
  const [showStealthModal, setShowStealthModal] = useState(false);
  const [stealthInstitution, setStealthInstitution] = useState<Institution | null>(null);
  const [stealthRole, setStealthRole] = useState('admin');
  const [stealthLogging, setStealthLogging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Guard: only super admins
    if (!isSuperAdmin && !SUPERADMIN_EMAILS.includes(user?.email || '')) {
      navigate('/login');
    }
  }, [isSuperAdmin, user]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Load analytics view
      const { data: analytics } = await supabase
        .from('ct_platform_analytics')
        .select('*')
        .order('total_users', { ascending: false });

      // The analytics view returns institution_id, map it to id
      setInstitutions(((analytics || []) as any[]).map(i => ({
        ...i,
        id: i.institution_id || i.id,
        name: i.institution_name || i.name,
      })) as Institution[]);

      // Compute platform stats
      if (analytics) {
        const s: PlatformStats = {
          total_institutions: analytics.length,
          total_users: analytics.reduce((a: number, i: Institution) => a + (i.total_users || 0), 0),
          total_students: analytics.reduce((a: number, i: Institution) => a + (i.students || 0), 0),
          total_paid_users: analytics.reduce((a: number, i: Institution) => a + (i.paid_users || 0), 0),
          total_revenue: analytics.reduce((a: number, i: Institution) => a + (parseFloat(String(i.total_revenue)) || 0), 0),
          active_subscriptions: analytics.filter((i: Institution) => i.subscription_status === 'active').length,
          trial_subscriptions: analytics.filter((i: Institution) => i.subscription_status === 'trial').length,
        };
        setStats(s);
      }

      // Load all users
      const { data: users } = await supabase
        .from('ct_users')
        .select('id, email, full_name, role, payment_status, institution_id, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      setAllUsers(users || []);

      // Compute role distribution
      const roleCounts: Record<string, number> = {};
      (users || []).forEach((u: any) => {
        roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
      });
      setRoleDist(Object.entries(roleCounts).map(([role, count]) => ({ role, count })));

      // Compute user growth from loaded users
      const growthBucket: Record<string, number> = {};
      const since30 = Date.now() - 30 * 24 * 60 * 60 * 1000;
      (users || []).forEach((u: any) => {
        if (new Date(u.created_at).getTime() > since30) {
          const d = u.created_at.slice(0, 10);
          growthBucket[d] = (growthBucket[d] || 0) + 1;
        }
      });
      setUserGrowth(Object.entries(growthBucket).sort().map(([date, count]) => ({ date, count })));

      // Top institutions by user count
      const instCounts: Record<string, { name: string; count: number }> = {};
      (users || []).forEach((u: any) => {
        const instName = (u.ct_institutions as any)?.name || u.institution_id || 'Unknown';
        if (!instCounts[instName]) instCounts[instName] = { name: instName, count: 0 };
        instCounts[instName].count += 1;
      });
      setTopInstitutions(Object.values(instCounts).sort((a, b) => b.count - a.count).slice(0, 5));

      // Load all invoices
      const { data: invoices } = await supabase
        .from('ct_billing_invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setAllInvoices(invoices || []);

      // Load stealth sessions
      const { data: stealth } = await supabase
        .from('ct_stealth_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50);
      setStealthSessions(stealth || []);

      // Alert/Error management from audit logs (last 14 days)
      const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const { data: logs } = await supabase
        .from('ct_audit_logs')
        .select('created_at,severity')
        .gte('created_at', since)
        .order('created_at', { ascending: true });

      const bucket: Record<string, { errors: number; warnings: number }> = {};
      (logs || []).forEach((l: any) => {
        const d = new Date(l.created_at).toISOString().slice(0, 10);
        if (!bucket[d]) bucket[d] = { errors: 0, warnings: 0 };
        if (l.severity === 'error' || l.severity === 'critical') bucket[d].errors += 1;
        if (l.severity === 'warning') bucket[d].warnings += 1;
      });
      setErrorAlerts(Object.entries(bucket).map(([date, v]) => ({ date, ...v })));

      // Product usage analytics
      const [ev, cb, lg, sv] = await Promise.all([
        supabase.from('ct_events').select('id', { count: 'exact', head: true }),
        supabase.from('ct_clubs').select('id', { count: 'exact', head: true }),
        supabase.from('ct_sports_leagues').select('id', { count: 'exact', head: true }),
        supabase.from('ct_surveys').select('id', { count: 'exact', head: true }),
      ]);
      setUsageSummary({
        events: ev.count || 0,
        clubs: cb.count || 0,
        leagues: lg.count || 0,
        challenges: 0,
        surveys: sv.count || 0,
      });

      // Error logs for Alerts tab
      const { data: eLogs } = await supabase
        .from('ct_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setErrorLogs(eLogs || []);

      // User growth last 30 days - compute from users
      // (will be populated after users load below)
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const initiateStealthLogin = async () => {
    if (!stealthInstitution) return;
    setStealthLogging(true);
    try {
      // Log the stealth session
      const { data: superadminRec } = await supabase
        .from('ct_superadmins')
        .select('id')
        .eq('email', user?.email || '')
        .maybeSingle();

      if (superadminRec) {
        await supabase.from('ct_stealth_sessions').insert({
          superadmin_id: superadminRec.id,
          target_institution_id: stealthInstitution.id,
          target_role: stealthRole,
          started_at: new Date().toISOString(),
          notes: `Stealth login to ${stealthInstitution.name} as ${stealthRole}`,
        });
      }

      // Store stealth context in sessionStorage
      sessionStorage.setItem('ct_stealth_mode', JSON.stringify({
        institutionId: stealthInstitution.id,
        institutionName: stealthInstitution.name,
        role: stealthRole,
        startedAt: new Date().toISOString(),
      }));

      setShowStealthModal(false);
      setStealthLogging(false);

      // Navigate to the appropriate dashboard
      const paths: Record<string, string> = {
        admin: '/dashboard/admin',
        it_director: '/dashboard/admin',
        teacher: '/dashboard/teacher',
        coach: '/dashboard/coach',
        student: '/dashboard/student',
        staff: '/dashboard/staff',
        parent: '/dashboard/parent',
      };
      navigate(paths[stealthRole] || '/dashboard/admin');
    } catch (e) {
      console.error(e);
      setStealthLogging(false);
    }
  };

  const statCards = stats ? [
    { label: 'Total Institutions', value: stats.total_institutions, icon: Building2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Users', value: stats.total_users.toLocaleString(), icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Paid Seats', value: stats.total_paid_users.toLocaleString(), icon: UserCheck, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Revenue', value: `$${stats.total_revenue.toFixed(0)} CAD`, icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
    { label: 'Active Subscriptions', value: stats.active_subscriptions, icon: Activity, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Trial Institutions', value: stats.trial_subscriptions, icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
  ] : [];

  const filteredInstitutions = institutions.filter(i =>
    !search || i.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = allUsers.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'institutions', label: 'Institutions', icon: Building2 },
    { id: 'users', label: 'All Users', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: errorLogs.filter(e => !e.resolved_at).length },
    { id: 'stealth', label: 'Stealth Log', icon: Eye },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary mx-auto mb-3" />
          <p className="text-on-surface-variant font-jakarta">Loading Campus Tribe Admin Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 fixed inset-y-0 left-0 flex flex-col z-20 hidden lg:flex">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100 dark:border-slate-700">
          <CampusTribeLogo className="w-8 h-8" animated showText />
          <div className="mt-2 flex items-center gap-1.5">
            <Shield size={12} className="text-red-500" />
            <span className="text-xs font-jakarta font-800 text-red-600">SUPER ADMIN</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); try { localStorage.setItem('ct_tab_superadmin', item.id); } catch {} }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-jakarta font-600 transition-all text-left ${
                activeTab === item.id
                  ? 'bg-primary-container text-primary font-700'
                  : 'text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon size={16} className="shrink-0" />
              <span className="flex-1">{item.label}</span>
              {(item as any).badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-jakarta font-900">{(item as any).badge}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs font-jakarta font-700 text-gray-700 dark:text-gray-300 truncate">{user?.email}</p>
          <button
            onClick={async () => { await signOut(); navigate('/login'); }}
            className="mt-2 flex items-center gap-2 text-xs text-gray-500 hover:text-red-600 font-jakarta"
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-60 min-h-screen">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 lg:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <CampusTribeLogo className="w-7 h-7" animated showText />
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-red-500" />
              <span className="text-sm font-jakarta font-800 text-red-600 hidden sm:inline">Super Admin Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 w-40 md:w-56"
              />
            </div>
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${refreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div>
                <h1 className="text-xl font-lexend font-900 text-gray-900 dark:text-white">Platform Overview</h1>
                <p className="text-sm text-gray-500 mt-0.5">Campus Tribe platform-wide analytics and health</p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
                {statCards.map(card => (
                  <div key={card.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                      <card.icon size={20} />
                    </div>
                    <p className="text-2xl font-lexend font-900 text-gray-900 dark:text-white">{card.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5 font-jakarta">{card.label}</p>
                  </div>
                ))}
              </div>

              {/* Visual analytics */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
                  <h3 className="font-jakarta font-800 text-gray-900 dark:text-white mb-3">User Growth by Institution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={institutions.map(i => ({ name: (i.institution_name || i.name || '').slice(0, 16), users: i.total_users || 0, paid: i.paid_users || 0 }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="users" fill="#3b82f6" name="Total Users" radius={[6,6,0,0]} />
                        <Bar dataKey="paid" fill="#10b981" name="Paid Users" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
                  <h3 className="font-jakarta font-800 text-gray-900 dark:text-white mb-3">Revenue / Billing Status</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={[
                          { name: 'Paid Invoices', value: allInvoices.filter(i => i.status === 'paid').length },
                          { name: 'Pending', value: allInvoices.filter(i => i.status === 'pending').length },
                          { name: 'Failed', value: allInvoices.filter(i => i.status === 'failed').length },
                        ]} dataKey="value" cx="50%" cy="50%" outerRadius={86} label>
                          {['#10b981','#f59e0b','#ef4444'].map((c, idx) => <Cell key={idx} fill={c} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 xl:col-span-2">
                  <h3 className="font-jakarta font-800 text-gray-900 dark:text-white mb-3">Alert & Error Management (Last 14 Days)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={errorAlerts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="warnings" stroke="#f59e0b" fill="#fef3c7" name="Warnings" />
                        <Area type="monotone" dataKey="errors" stroke="#ef4444" fill="#fee2e2" name="Errors" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Product usage metrics */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Events', value: usageSummary.events, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Clubs', value: usageSummary.clubs, color: 'text-purple-600 bg-purple-50' },
                  { label: 'Leagues', value: usageSummary.leagues, color: 'text-green-600 bg-green-50' },
                  { label: 'Challenges', value: usageSummary.challenges, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Surveys', value: usageSummary.surveys, color: 'text-pink-600 bg-pink-50' },
                ].map(m => (
                  <div key={m.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
                    <div className={`inline-flex px-2 py-1 rounded-full text-xs font-jakarta font-700 ${m.color}`}>{m.label}</div>
                    <p className="text-2xl font-lexend font-900 text-gray-900 dark:text-white mt-2">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent institutions */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
                  <h2 className="font-jakarta font-800 text-gray-900 dark:text-white">Recent Institutions</h2>
                  <button onClick={() => setActiveTab('institutions')} className="text-xs text-primary font-jakarta font-700 flex items-center gap-1">
                    View All <ChevronRight size={12} />
                  </button>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-slate-700">
                  {institutions.slice(0, 5).map(inst => (
                    <div key={inst.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                        <Building2 size={14} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-jakarta font-700 text-gray-900 dark:text-white truncate">{inst.institution_name || inst.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{inst.institution_type} · {inst.total_users || 0} users</p>
                      </div>
                      <span className={`text-xs rounded-full px-2.5 py-0.5 font-jakarta font-700 ${
                        inst.subscription_status === 'active' ? 'text-green-600 bg-green-50' :
                        inst.subscription_status === 'trial' ? 'text-amber-600 bg-amber-50' :
                        'text-gray-600 bg-gray-100'
                      }`}>
                        {inst.subscription_status || 'trial'}
                      </span>
                      <button
                        onClick={() => { setStealthInstitution(inst); setShowStealthModal(true); }}
                        className="text-xs text-primary font-jakarta font-700 flex items-center gap-1 shrink-0 hover:underline"
                      >
                        <Eye size={12} /> Login
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Institutions Tab */}
          {activeTab === 'institutions' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-lexend font-900 text-gray-900 dark:text-white">All Institutions ({filteredInstitutions.length})</h1>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-gray-50 dark:divide-slate-700">
                  {filteredInstitutions.map(inst => (
                    <div key={inst.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
                      <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
                        <Building2 size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-jakarta font-700 text-gray-900 dark:text-white">{inst.institution_name || inst.name}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-gray-500 capitalize">{inst.institution_type}</span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500">{inst.total_users || 0} users</span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500">{inst.paid_users || 0} paid</span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500">Revenue: ${parseFloat(inst.total_revenue as any || 0).toFixed(2)} CAD</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs rounded-full px-2.5 py-0.5 font-jakarta font-700 ${
                          inst.subscription_status === 'active' ? 'text-green-600 bg-green-50' :
                          inst.subscription_status === 'trial' ? 'text-amber-600 bg-amber-50' :
                          'text-gray-600 bg-gray-100'
                        }`}>
                          {inst.subscription_status || 'trial'}
                        </span>
                        <button
                          onClick={() => { setStealthInstitution(inst); setShowStealthModal(true); }}
                          className="flex items-center gap-1.5 text-xs bg-primary text-white rounded-full px-3 py-1.5 font-jakarta font-700 hover:bg-primary/90 transition-colors"
                        >
                          <Eye size={11} /> Stealth Login
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredInstitutions.length === 0 && (
                    <div className="py-10 text-center text-gray-400 text-sm">No institutions found</div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* All Users Tab */}
          {activeTab === 'users' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-lexend font-900 text-gray-900 dark:text-white">All Users ({filteredUsers.length})</h1>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-gray-50 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-lexend font-800 shrink-0">
                        {(u.full_name || u.email || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-jakarta font-700 text-gray-900 dark:text-white truncate">{u.full_name || '—'}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        {u.ct_institutions?.name && (
                          <p className="text-xs text-gray-400 truncate">{u.ct_institutions.name}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5 font-jakarta capitalize">
                          {u.role?.replace('_', ' ')}
                        </span>
                        <span className={`text-xs rounded-full px-2 py-0.5 font-jakarta font-700 ${
                          u.payment_status === 'paid' ? 'text-green-600 bg-green-50' :
                          u.payment_status === 'not_required' ? 'text-gray-500 bg-gray-50' :
                          'text-amber-600 bg-amber-50'
                        }`}>
                          {u.payment_status === 'paid' ? 'Paid' : u.payment_status === 'not_required' ? 'Free' : 'Unpaid'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="py-10 text-center text-gray-400 text-sm">No users found</div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <>
              <h1 className="text-xl font-lexend font-900 text-gray-900 dark:text-white">Platform Billing</h1>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
                  <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                  <p className="text-2xl font-lexend font-900 text-gray-900 dark:text-white">${stats?.total_revenue.toFixed(2) || '0.00'} CAD</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
                  <p className="text-xs text-gray-500 mb-1">Total Invoices</p>
                  <p className="text-2xl font-lexend font-900 text-gray-900 dark:text-white">{allInvoices.length}</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700">
                  <h3 className="font-jakarta font-800 text-gray-900 dark:text-white">Recent Invoices</h3>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-slate-700 max-h-96 overflow-y-auto">
                  {allInvoices.map(inv => (
                    <div key={inv.id} className="flex items-center gap-4 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-jakarta font-700 text-gray-900 dark:text-white">{inv.ct_institutions?.name || '—'}</p>
                        <p className="text-xs text-gray-500">{inv.notes || 'Invoice'} · {new Date(inv.created_at).toLocaleDateString('en-CA')}</p>
                      </div>
                      <p className="text-sm font-jakarta font-700 text-gray-900 dark:text-white shrink-0">${inv.amount?.toFixed(2)} {inv.currency}</p>
                      <span className={`text-xs rounded-full px-2.5 py-0.5 font-jakarta font-700 shrink-0 ${
                        inv.status === 'paid' ? 'text-green-600 bg-green-50' :
                        inv.status === 'pending' ? 'text-amber-600 bg-amber-50' :
                        'text-red-600 bg-red-50'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  ))}
                  {allInvoices.length === 0 && (
                    <div className="py-8 text-center text-gray-400 text-sm">No invoices yet</div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Stealth Log Tab */}
          {activeTab === 'stealth' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-lexend font-900 text-gray-900 dark:text-white">Stealth Session Log</h1>
                <p className="text-xs text-gray-400 font-jakarta">Only visible to super admins</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="divide-y divide-gray-50 dark:divide-slate-700">
                  {stealthSessions.map(s => (
                    <div key={s.id} className="flex items-start gap-3 px-5 py-3">
                      <Eye size={16} className="text-purple-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-jakarta font-700 text-gray-900 dark:text-white">{s.notes || 'Stealth login'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(s.started_at).toLocaleString('en-CA')}
                          {s.ended_at ? ` → ${new Date(s.ended_at).toLocaleString('en-CA')}` : ' (active)'}
                        </p>
                      </div>
                      <span className={`text-xs rounded-full px-2 py-0.5 font-jakarta font-700 shrink-0 ${s.ended_at ? 'text-gray-500 bg-gray-100' : 'text-green-600 bg-green-50'}`}>
                        {s.ended_at ? 'Ended' : 'Active'}
                      </span>
                    </div>
                  ))}
                  {stealthSessions.length === 0 && (
                    <div className="py-8 text-center text-gray-400 text-sm">No stealth sessions logged</div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <>
              <h1 className="text-xl font-lexend font-900 text-gray-900 dark:text-white">Platform Analytics</h1>
              {/* User growth chart */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
                <h3 className="font-jakarta font-800 text-gray-900 dark:text-white mb-4">User Growth — Last 30 Days</h3>
                {userGrowth.length === 0 ? (
                  <p className="text-sm text-gray-500">No new users in the past 30 days.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="count" stroke="#0047AB" fill="#0047AB20" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              {/* Feature usage */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
                <h3 className="font-jakarta font-800 text-gray-900 dark:text-white mb-4">Feature Usage</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { feature: 'Events', count: usageSummary.events },
                    { feature: 'Clubs', count: usageSummary.clubs },
                    { feature: 'Leagues', count: usageSummary.leagues },
                    { feature: 'Surveys', count: usageSummary.surveys },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0047AB" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Role distribution */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
                  <h3 className="font-jakarta font-800 text-gray-900 dark:text-white mb-4">Role Distribution</h3>
                  {roleDist.length === 0 ? <p className="text-sm text-gray-500">No data.</p> : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={roleDist} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={80} label={({ role }) => role}>
                          {roleDist.map((_, i) => (
                            <Cell key={i} fill={['#0047AB','#1a5fc9','#3A6FD0','#6B9FE8','#A8C5F5','#C8DDF9','#E0ECFF','#4CAF50','#FFC107','#FF5722'][i % 10]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
                  <h3 className="font-jakarta font-800 text-gray-900 dark:text-white mb-4">Top 5 Institutions by Users</h3>
                  {topInstitutions.length === 0 ? <p className="text-sm text-gray-500">No data.</p> : (
                    <div className="space-y-3">
                      {topInstitutions.map((inst, i) => (
                        <div key={inst.name} className="flex items-center gap-3">
                          <span className="text-xs font-jakarta font-900 text-gray-400 w-4">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-jakarta font-700 text-gray-900 dark:text-white truncate">{inst.name}</p>
                            <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                              <div className="h-1.5 bg-primary rounded-full" style={{ width: `${(inst.count / (topInstitutions[0]?.count || 1)) * 100}%` }} />
                            </div>
                          </div>
                          <span className="text-sm font-jakarta font-900 text-primary">{inst.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-lexend font-900 text-gray-900 dark:text-white">System Alerts</h1>
                <div className="flex gap-2">
                  {(['all','error','warning','info'] as const).map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setAlertLevelFilter(lvl)}
                      className={`px-3 py-1.5 rounded-full text-xs font-jakarta font-700 transition-all ${alertLevelFilter === lvl ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}
                    >
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
                {errorLogs.filter(e => alertLevelFilter === 'all' || e.level === alertLevelFilter).length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-sm">No alerts found.</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-700">
                      <tr>
                        {['Level','Message','Created','Resolved','Action'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-jakarta text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                      {errorLogs
                        .filter(e => alertLevelFilter === 'all' || e.level === alertLevelFilter)
                        .map(e => (
                          <tr key={e.id} className={e.resolved_at ? 'opacity-50' : ''}>
                            <td className="px-4 py-3">
                              <span className={`inline-block text-xs font-jakarta font-700 px-2 py-0.5 rounded-full ${
                                e.level === 'error' ? 'bg-red-100 text-red-700' :
                                e.level === 'warning' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>{e.level}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs truncate">{e.message}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">{new Date(e.created_at).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-xs text-gray-500">{e.resolved_at ? new Date(e.resolved_at).toLocaleDateString() : '—'}</td>
                            <td className="px-4 py-3">
                              {!e.resolved_at && (
                                <button
                                  onClick={async () => {
                                    await supabase.from('ct_error_logs').update({ resolved_at: new Date().toISOString(), resolved_by: user?.id }).eq('id', e.id);
                                    setErrorLogs(prev => prev.map(x => x.id === e.id ? { ...x, resolved_at: new Date().toISOString() } : x));
                                  }}
                                  className="text-xs font-jakarta font-700 text-primary hover:underline"
                                >
                                  Resolve
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <>
              <h1 className="text-xl font-lexend font-900 text-gray-900 dark:text-white">Super Admin Settings</h1>
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5">
                <h3 className="font-jakarta font-800 text-gray-900 dark:text-white mb-3">Super Admin List</h3>
                <div className="space-y-2">
                  {SUPERADMIN_EMAILS.map(email => (
                    <div key={email} className="flex items-center gap-3 py-2 px-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                      <Shield size={14} className="text-red-500 shrink-0" />
                      <span className="text-sm font-jakarta text-gray-700 dark:text-gray-300">{email}</span>
                      {email === user?.email && (
                        <span className="ml-auto text-xs bg-primary-container text-primary rounded-full px-2 py-0.5 font-jakarta font-700">You</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Stealth Login Modal */}
      {showStealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-lexend font-900 text-gray-900 dark:text-white text-lg">Stealth Login</h3>
                <p className="text-xs text-gray-500 mt-0.5">This session will be logged</p>
              </div>
              <button onClick={() => setShowStealthModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
              <Shield size={14} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600 font-jakarta font-600">This action is logged and auditable</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-jakarta font-700 text-gray-600 block mb-1.5">Target Institution</label>
                <select
                  value={stealthInstitution?.id || ''}
                  onChange={e => setStealthInstitution(institutions.find(i => i.id === e.target.value) || null)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-jakarta bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select institution...</option>
                  {institutions.map(i => (
                    <option key={i.id} value={i.id}>{i.institution_name || i.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-jakarta font-700 text-gray-600 block mb-1.5">Login As Role</label>
                <select
                  value={stealthRole}
                  onChange={e => setStealthRole(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-jakarta bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="admin">Administrator</option>
                  <option value="it_director">IT Director</option>
                  <option value="teacher">Teacher / Faculty</option>
                  <option value="coach">Sports Coach</option>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
            </div>

            <button
              onClick={initiateStealthLogin}
              disabled={!stealthInstitution || stealthLogging}
              className="mt-5 w-full bg-primary text-white rounded-xl py-3 text-sm font-jakarta font-700 hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {stealthLogging ? <><Loader2 size={16} className="animate-spin" /> Initiating...</> : <><Eye size={16} /> Enter Stealth Mode</>}
            </button>
          </div>
        </div>
      )}

      {/* Stealth mode indicator banner */}
      {(() => {
        const stealth = (() => { try { return JSON.parse(sessionStorage.getItem('ct_stealth_mode') || 'null'); } catch { return null; } })();
        if (!stealth) return null;
        return (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white rounded-full px-5 py-2.5 shadow-lg flex items-center gap-2 text-sm font-jakarta font-700">
            <Eye size={14} />
            Stealth: {stealth.institutionName} as {stealth.role}
            <button
              onClick={() => { sessionStorage.removeItem('ct_stealth_mode'); navigate('/admin'); }}
              className="ml-2 bg-white/20 hover:bg-white/30 rounded-full w-5 h-5 flex items-center justify-center"
            >
              <X size={10} />
            </button>
          </div>
        );
      })()}
    </div>
  );
}
