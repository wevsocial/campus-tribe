import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Search, Users } from 'lucide-react';

interface DirUser {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  department: string | null;
}

const ROLE_TABS = [
  { id: 'student', label: 'Students' },
  { id: 'teacher', label: 'Teachers' },
  { id: 'coach', label: 'Coaches' },
  { id: 'admin', label: 'Admin' },
  { id: 'it_director,staff', label: 'Ops & IT' },
];

export default function DirectoryPage() {
  const { institutionId, role } = useAuth();
  const canSeeEmail = role === 'admin' || role === 'it_director';
  const [activeRoleTab, setActiveRoleTab] = useState(ROLE_TABS[0].id);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<DirUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!institutionId) return;
    setLoading(true);
    const roles = activeRoleTab.includes(',') ? activeRoleTab.split(',') : [activeRoleTab];
    supabase
      .from('ct_users')
      .select('id, full_name, email, role, department')
      .eq('institution_id', institutionId)
      .in('role', roles)
      .then(({ data }) => {
        setUsers((data as DirUser[]) ?? []);
        setLoading(false);
      });
  }, [institutionId, activeRoleTab]);

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.full_name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  });

  const initials = (name: string | null, email: string) =>
    (name || email).split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-primary" />
          <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Directory</h1>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Role tabs */}
        <div className="flex gap-1 overflow-x-auto bg-surface-low rounded-2xl p-1.5">
          {ROLE_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveRoleTab(t.id); setSearch(''); }}
              className={`px-4 py-2 rounded-xl text-sm font-jakarta font-700 whitespace-nowrap transition-all flex-shrink-0 ${
                activeRoleTab === t.id ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-surface'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-28 bg-surface rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-on-surface-variant py-10">No members found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(u => (
              <div key={u.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-lexend font-900 text-sm shrink-0">
                  {initials(u.full_name, u.email)}
                </div>
                <div className="min-w-0 w-full">
                  <p className="font-jakarta font-700 text-on-surface text-sm truncate">{u.full_name || u.email}</p>
                  {u.department && <p className="text-xs text-on-surface-variant truncate">{u.department}</p>}
                  {canSeeEmail && <p className="text-xs text-on-surface-variant truncate">{u.email}</p>}
                  <span className="mt-1 inline-block text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-jakarta font-700 capitalize">
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
