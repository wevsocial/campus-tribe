import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Building2, ChevronRight, Loader2 } from 'lucide-react';
import CampusTribeLogo from '../ui/CampusTribeLogo';

interface Institution {
  id: string;
  name: string;
  institution_type: string | null;
  city: string | null;
  country: string | null;
}

export default function InstitutionSelector() {
  const { user, refreshProfile, refreshInstitution } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selected, setSelected] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('ct_institutions').select('id, name, institution_type, city, country').order('name').then(({ data }) => {
      setInstitutions((data as Institution[]) ?? []);
      setLoading(false);
    });
  }, []);

  const handleSelect = async () => {
    if (!selected || !user?.id) return;
    setSaving(true);
    await supabase.from('ct_users').update({ institution_id: selected }).eq('id', user.id);
    await refreshProfile(user.id);
    await refreshInstitution(selected);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8">
        <div className="mb-6 flex justify-center">
          <CampusTribeLogo className="w-10 h-10" animated showText />
        </div>
        <h1 className="font-lexend font-black text-2xl text-gray-900 dark:text-white text-center mb-2">Select Your Institution</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 font-jakarta text-center mb-6">Choose the institution you belong to.</p>
        <div className="space-y-4">
          <div className="relative">
            <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-gray-900 dark:text-white"
            >
              <option value="">-- Select an institution --</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}{inst.city ? ` · ${inst.city}` : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSelect}
            disabled={!selected || saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-jakarta font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
