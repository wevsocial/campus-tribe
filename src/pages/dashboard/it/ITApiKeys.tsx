import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface ApiKey { id: string; name: string; key_prefix: string; scopes: string[]; is_active: boolean; created_at: string; }

export default function ITApiKeys() {
  const { user, institutionId } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_api_keys').select('id,name,key_prefix,scopes,is_active,created_at').eq('institution_id', institutionId).order('created_at', { ascending: false })
      .then(({ data }) => { setKeys((data as ApiKey[]) ?? []); setLoading(false); });
  }, [institutionId]);

  const createKey = async () => {
    if (!newName.trim() || !institutionId || !user?.id) return;
    setCreating(true);
    const prefix = 'ct_' + Math.random().toString(36).substring(2, 8);
    const { data } = await supabase.from('ct_api_keys').insert({
      name: newName, institution_id: institutionId, created_by: user.id,
      key_prefix: prefix, key_hash: prefix + '_hash', scopes: ['read'], is_active: true,
    }).select('id,name,key_prefix,scopes,is_active,created_at').single();
    if (data) { setKeys([data as ApiKey, ...keys]); setNewName(''); }
    setCreating(false);
  };

  const revokeKey = async (id: string) => {
    await supabase.from('ct_api_keys').update({ is_active: false }).eq('id', id);
    setKeys(keys.map(k => k.id === id ? { ...k, is_active: false } : k));
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">API Keys</h1>
      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Generate New Key</h2>
        <div className="flex gap-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Key name (e.g. LMS integration)"
            onKeyDown={e => e.key === 'Enter' && createKey()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <Button onClick={createKey} isLoading={creating} className="rounded-full">Generate</Button>
        </div>
      </Card>
      {keys.length === 0 ? <EmptyState message="No API keys yet." /> : (
        <div className="space-y-3">
          {keys.map(k => (
            <Card key={k.id} className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-jakarta font-bold text-on-surface">{k.name}</p>
                <p className="font-mono text-xs text-on-surface-variant mt-0.5">{k.key_prefix}••••••••</p>
                <div className="flex gap-1 mt-1">{(k.scopes || []).map(s => <Badge key={s} label={s} variant="neutral" size="sm" />)}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge label={k.is_active ? 'Active' : 'Revoked'} variant={k.is_active ? 'success' : 'danger'} />
                {k.is_active && <Button size="sm" variant="outline" onClick={() => revokeKey(k.id)} className="rounded-full">Revoke</Button>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
