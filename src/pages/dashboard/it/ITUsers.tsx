import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface User { id: string; email: string; full_name: string | null; role: string; created_at: string; }

const roleVariant = (role: string) => {
  if (role === 'admin') return 'danger';
  if (role === 'it_director') return 'warning';
  if (role === 'teacher' || role === 'coach') return 'secondary';
  return 'primary';
};

export default function ITUsers() {
  const { institutionId } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_users').select('id,email,full_name,role,created_at').eq('institution_id', institutionId).order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data ?? []); setLoading(false); });
  }, [institutionId]);

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Users</h1>
        <span className="font-jakarta text-sm text-on-surface-variant">{users.length} total</span>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, role..."
        className="w-full px-4 py-2.5 rounded-xl bg-surface-lowest border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
      {filtered.length === 0 ? <EmptyState message="No users found." /> : (
        <div className="space-y-2">
          {filtered.map(u => (
            <Card key={u.id} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="font-jakarta font-bold text-primary text-xs">{(u.full_name || u.email).slice(0,2).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-jakarta font-bold text-on-surface text-sm truncate">{u.full_name || '—'}</p>
                  <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
                </div>
              </div>
              <Badge label={u.role.replace('_',' ')} variant={roleVariant(u.role) as 'danger' | 'warning' | 'secondary' | 'primary'} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
