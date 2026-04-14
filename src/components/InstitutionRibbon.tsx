import React, { useEffect, useState } from 'react';
import { School } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function InstitutionRibbon() {
  const { institutionId } = useAuth();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!institutionId) return;
    supabase
      .from('ct_institutions')
      .select('name')
      .eq('id', institutionId)
      .maybeSingle()
      .then(({ data }) => setName(data?.name ?? null));
  }, [institutionId]);

  if (!institutionId) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-sm">
      <School size={13} />
      <span>{name || 'Your Institution'}</span>
    </div>
  );
}
