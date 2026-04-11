import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import ProfilePhotoUpload from '../../../components/ui/ProfilePhotoUpload';
import NotificationPrefsPanel from '../../../components/ui/NotificationPrefsPanel';
import BillingSection from '../../../components/billing/BillingSection';

export default function CoachSettings() {
  const { profile, user, institutionId, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    bio: (profile as unknown as Record<string, unknown>)?.bio as string || '',
    department: (profile as unknown as Record<string, unknown>)?.department as string || '',
    phone: (profile as unknown as Record<string, unknown>)?.phone as string || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const save = async () => {
    if (!user?.id) return;
    setSaving(true);
    await supabase.from('ct_users').update(form).eq('id', user.id);
    await refreshProfile(user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) { setPwMsg('Password must be at least 6 characters'); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    setPwMsg(error ? 'Error: ' + error.message : 'Password updated successfully');
    setNewPassword('');
    setTimeout(() => setPwMsg(''), 3000);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #FF7F50, #ff6030)' }}>
        <h1 className="font-lexend font-900 text-2xl mb-1">Coach Settings</h1>
        <p className="font-jakarta text-white/80 text-sm">Manage your profile and preferences</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Profile Photo</h3>
        {user?.id && (
          <ProfilePhotoUpload
            userId={user.id}
            currentUrl={(profile as unknown as Record<string, unknown>)?.avatar_url as string | null}
            displayName={form.full_name}
          />
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Profile Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'full_name', type: 'text' },
            { label: 'Phone', key: 'phone', type: 'tel' },
            { label: 'Department / Sport', key: 'department', type: 'text' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">{field.label}</label>
              <input
                type={field.type}
                className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-secondary"
                value={(form as Record<string, string>)[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">Bio</label>
            <textarea
              className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-secondary"
              rows={3}
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            />
          </div>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`mt-5 px-6 py-2.5 rounded-xl font-jakarta font-700 text-sm text-white transition-colors disabled:opacity-50 ${saved ? 'bg-tertiary' : 'bg-secondary hover:bg-secondary/90'}`}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-float border border-outline-variant/30">
        {user?.id && (
          <NotificationPrefsPanel userId={user.id} institutionId={institutionId} role="coach" />
        )}
      </div>

      <BillingSection isAdmin={false} />

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-float border border-outline-variant/30">
        <h3 className="font-lexend font-700 text-on-surface mb-4">Change Password</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-jakarta font-700 text-on-surface-variant mb-1">New Password</label>
            <input
              type="password"
              className="w-full border border-outline-variant rounded-xl px-4 py-2.5 font-jakarta text-sm bg-surface dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-secondary"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />
          </div>
          <button
            onClick={changePassword}
            disabled={pwSaving}
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-jakarta font-700 text-sm disabled:opacity-50"
          >
            {pwSaving ? 'Updating...' : 'Update'}
          </button>
        </div>
        {pwMsg && (
          <p className={`text-xs font-jakarta mt-2 ${pwMsg.startsWith('Error') ? 'text-red-500' : 'text-tertiary'}`}>
            {pwMsg}
          </p>
        )}
      </div>
    </div>
  );
}
