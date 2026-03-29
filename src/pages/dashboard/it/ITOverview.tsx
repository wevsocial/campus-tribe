import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import StatCard from '../../../components/ui/StatCard';
import Card from '../../../components/ui/Card';
import { StatSkeleton } from '../../../components/ui/LoadingSkeleton';
import { ShieldCheck } from 'lucide-react';

export default function ITOverview() {
  const { institutionId } = useAuth();
  const [stats, setStats] = useState({ users: 0, apiKeys: 0, auditEvents: 0, roles: {} as Record<string, number> });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_users').select('id,role', { count: 'exact' }).eq('institution_id', institutionId),
      supabase.from('ct_api_keys').select('id', { count: 'exact' }).eq('institution_id', institutionId).eq('is_active', true),
      supabase.from('ct_audit_logs').select('id', { count: 'exact' }).eq('institution_id', institutionId),
    ]).then(([users, keys, audit]) => {
      const roleCounts: Record<string, number> = {};
      (users.data ?? []).forEach((u: { role: string }) => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });
      setStats({ users: users.count ?? 0, apiKeys: keys.count ?? 0, auditEvents: audit.count ?? 0, roles: roleCounts });
      setLoading(false);
    });
  }, [institutionId]);

  if (loading) return <div className="space-y-6"><h1 className="font-lexend text-2xl font-extrabold text-on-surface">IT Overview</h1><StatSkeleton /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">IT Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value={stats.users} label="Total Users" icon="people" color="primary" />
        <StatCard value={stats.apiKeys} label="Active API Keys" icon="key" color="secondary" />
        <StatCard value={stats.auditEvents} label="Audit Events" icon="history" color="neutral" />
      </div>
      <div className="bg-surface-lowest rounded-2xl p-5">
        <h2 className="font-lexend font-bold text-on-surface mb-4">Users by Role</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(stats.roles).map(([role, count]) => (
            <div key={role} className="bg-primary-container rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="font-jakarta text-sm font-bold text-on-surface capitalize">{role.replace('_', ' ')}</span>
              <span className="font-lexend font-bold text-primary text-lg">{count}</span>
            </div>
          ))}
          {Object.keys(stats.roles).length === 0 && <p className="text-on-surface-variant font-jakarta text-sm col-span-3">No user data</p>}
        </div>
      </div>

      {/* SOC 2 Status — Module 15 */}
      <Card>
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className="text-amber-500" />
          <div className="flex-1">
            <p className="font-jakarta font-700 text-on-surface text-sm">SOC 2 Type II Certification</p>
            <p className="text-xs text-on-surface-variant font-jakarta">Certification in progress — expected Q3 2026</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 text-xs font-jakarta font-700 border border-amber-200 dark:border-amber-700">
            In Progress
          </span>
        </div>
        <div className="mt-3 h-2 bg-surface-high rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full" style={{ width: '65%' }} />
        </div>
        <p className="text-xs text-on-surface-variant font-jakarta mt-1">65% complete</p>
      </Card>
    </div>
  );
}
