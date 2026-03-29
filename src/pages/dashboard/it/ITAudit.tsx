import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface AuditLog { id: string; action: string; resource_type: string | null; severity: string | null; created_at: string; actor_id: string | null; }

const severityVariant = (s: string | null) => s === 'high' || s === 'critical' ? 'danger' : s === 'medium' ? 'warning' : 'neutral';

export default function ITAudit() {
  const { institutionId } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_audit_logs').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setLogs(data ?? []); setLoading(false); });
  }, [institutionId]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Audit Log</h1>
        <span className="font-jakarta text-sm text-on-surface-variant">{logs.length} events</span>
      </div>
      {logs.length === 0 ? <EmptyState icon="📜" message="No audit events recorded yet." /> : (
        <Card padding="none">
          <div className="divide-y divide-outline-variant/20">
            {logs.map(log => (
              <div key={log.id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-jakarta font-bold text-on-surface text-sm truncate">{log.action}</p>
                  <p className="text-xs text-on-surface-variant">{log.resource_type || 'system'} · {new Date(log.created_at).toLocaleString()}</p>
                </div>
                <Badge label={log.severity || 'low'} variant={severityVariant(log.severity) as 'danger' | 'warning' | 'neutral'} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
