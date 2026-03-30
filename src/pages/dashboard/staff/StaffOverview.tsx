import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import StatCard from '../../../components/ui/StatCard';
import { StatSkeleton } from '../../../components/ui/LoadingSkeleton';
import { LayoutList, Users } from 'lucide-react';

export default function StaffOverview() {
  const { institutionId } = useAuth();
  const [stats, setStats] = useState({ users: 0, events: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_users').select('id', { count: 'exact' }).eq('institution_id', institutionId),
      supabase.from('ct_events').select('id', { count: 'exact' }).eq('institution_id', institutionId),
    ]).then(([u, e]) => {
      setStats({ users: u.count ?? 0, events: e.count ?? 0 });
      setLoading(false);
    });
  }, [institutionId]);

  if (loading) return <div className="space-y-6"><h1 className="font-lexend text-2xl font-extrabold text-on-surface">Staff Overview</h1><StatSkeleton /></div>;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Staff Overview</h1>
      <div className="grid grid-cols-2 gap-4">
        <StatCard value={stats.users} label="Total Users" color="primary" />
        <StatCard value={stats.events} label="Events" color="secondary" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Daily Reports', href: '/dashboard/staff/reports', Icon: LayoutList },
          { label: 'Parent Updates', href: '/dashboard/staff/updates', Icon: Users },
        ].map(l => (
          <a key={l.href} href={l.href} className="bg-surface-lowest rounded-xl p-4 flex items-center gap-3 hover:bg-primary-container transition-colors group">
            <l.Icon size={18} className="text-primary flex-shrink-0" />
            <span className="font-jakarta font-bold text-sm text-on-surface group-hover:text-primary">{l.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
