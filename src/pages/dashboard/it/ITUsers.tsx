import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { X } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  roles: string[] | null;
  created_at: string;
}

const ALL_ASSIGNABLE_ROLES = ['student', 'coach', 'club_leader', 'student_rep', 'parent', 'staff', 'teacher'];

const roleVariant = (role: string) => {
  if (role === 'admin') return 'danger';
  if (role === 'it_director') return 'warning';
  if (role === 'teacher' || role === 'coach') return 'secondary';
  return 'primary';
};

function ManageRolesModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: (updated: User) => void }) {
  const [selected, setSelected] = useState<string[]>(user.roles?.length ? user.roles : [user.role]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggle = (role: string) => {
    setSelected(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSave = async () => {
    if (selected.length === 0) { setError('Select at least one role.'); return; }
    setSaving(true);
    setError('');
    const primaryRole = selected[0];
    const { error: dbError } = await supabase
      .from('ct_users')
      .update({ roles: selected, role: primaryRole })
      .eq('id', user.id);
    setSaving(false);
    if (dbError) { setError(dbError.message); return; }
    onSaved({ ...user, roles: selected, role: primaryRole });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-lexend font-black text-xl text-gray-900 dark:text-white">Manage Roles</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-jakarta mt-1">{user.full_name || user.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2">
          {ALL_ASSIGNABLE_ROLES.map(role => (
            <label key={role} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-slate-700 cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={selected.includes(role)}
                onChange={() => toggle(role)}
                className="accent-blue-600 w-4 h-4"
              />
              <span className="font-jakarta text-sm text-gray-900 dark:text-white capitalize">{role.replace('_', ' ')}</span>
              {selected[0] === role && (
                <span className="ml-auto text-xs font-jakarta font-bold text-blue-600 dark:text-blue-400">Primary</span>
              )}
            </label>
          ))}
        </div>

        <p className="text-xs text-gray-500 dark:text-slate-400 font-jakarta">First selected role becomes the primary role.</p>

        {error && (
          <p className="text-sm text-red-500 font-jakarta">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-jakarta font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-jakarta font-bold text-sm transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save Roles'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ITUsers() {
  const { institutionId } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [managingUser, setManagingUser] = useState<User | null>(null);

  useEffect(() => {
    if (!institutionId) return;
    supabase
      .from('ct_users')
      .select('id,email,full_name,role,roles,created_at')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data ?? []); setLoading(false); });
  }, [institutionId]);

  const handleSaved = (updated: User) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {managingUser && (
        <ManageRolesModal
          user={managingUser}
          onClose={() => setManagingUser(null)}
          onSaved={handleSaved}
        />
      )}
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
                  {/* Role chips */}
                  {u.roles && u.roles.length > 1 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {u.roles.map(r => (
                        <Badge key={r} label={r.replace('_', ' ')} variant={roleVariant(r) as 'danger' | 'warning' | 'secondary' | 'primary'} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge label={u.role.replace('_',' ')} variant={roleVariant(u.role) as 'danger' | 'warning' | 'secondary' | 'primary'} />
                <button
                  onClick={() => setManagingUser(u)}
                  className="px-3 py-1.5 rounded-lg text-xs font-jakarta font-bold border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  Manage Roles
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
