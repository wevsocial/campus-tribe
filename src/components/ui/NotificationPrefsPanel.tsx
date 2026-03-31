import { useState, useEffect } from 'react';
import { Bell, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Props {
  userId: string;
  institutionId?: string | null;
  role: string;
}

const EVENT_TYPES_BY_ROLE: Record<string, { key: string; label: string }[]> = {
  student: [
    { key: 'new_assignment', label: 'New assignment posted' },
    { key: 'grade_published', label: 'Grade published' },
    { key: 'new_event', label: 'New event posted' },
    { key: 'club_announcement', label: 'Club announcement' },
    { key: 'survey_request', label: 'Survey requested' },
    { key: 'sports_update', label: 'Sports team update' },
    { key: 'general_announcement', label: 'General announcements' },
  ],
  teacher: [
    { key: 'assignment_submitted', label: 'Assignment submitted by student' },
    { key: 'course_enrollment', label: 'Student enrolled in course' },
    { key: 'general_announcement', label: 'General announcements' },
  ],
  club_leader: [
    { key: 'new_member', label: 'New member joined club' },
    { key: 'event_rsvp', label: 'Event RSVP received' },
    { key: 'general_announcement', label: 'General announcements' },
  ],
  coach: [
    { key: 'game_scheduled', label: 'Game scheduled' },
    { key: 'athlete_waiver', label: 'Athlete waiver signed' },
    { key: 'general_announcement', label: 'General announcements' },
  ],
  parent: [
    { key: 'child_grade', label: 'Child grade published' },
    { key: 'child_event', label: 'Child event notification' },
    { key: 'child_announcement', label: 'Child school announcement' },
    { key: 'general_announcement', label: 'General announcements' },
  ],
  admin: [
    { key: 'general_announcement', label: 'General announcements' },
    { key: 'system', label: 'System alerts' },
  ],
  staff: [
    { key: 'general_announcement', label: 'General announcements' },
    { key: 'system', label: 'System alerts' },
  ],
};

type PrefKey = `${string}:${string}`;

export default function NotificationPrefsPanel({ userId, institutionId, role }: Props) {
  const [prefs, setPrefs] = useState<Record<PrefKey, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const eventTypes = EVENT_TYPES_BY_ROLE[role] || EVENT_TYPES_BY_ROLE['admin'];

  useEffect(() => {
    supabase.from('ct_notification_prefs').select('*').eq('user_id', userId).then(({ data }) => {
      const map: Record<PrefKey, boolean> = {};
      (data || []).forEach((p: { channel: string; event_type: string; enabled: boolean }) => {
        map[`${p.channel}:${p.event_type}` as PrefKey] = p.enabled;
      });
      eventTypes.forEach(({ key }) => {
        if (map[`email:${key}` as PrefKey] === undefined) map[`email:${key}` as PrefKey] = true;
        if (map[`in_app:${key}` as PrefKey] === undefined) map[`in_app:${key}` as PrefKey] = true;
      });
      setPrefs(map);
    });
  }, [userId, role]);

  const toggle = (channel: string, eventType: string) => {
    const key = `${channel}:${eventType}` as PrefKey;
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  };

  const save = async () => {
    setSaving(true);
    const rows = eventTypes.flatMap(({ key }) => [
      { user_id: userId, institution_id: institutionId, channel: 'email', event_type: key, enabled: prefs[`email:${key}` as PrefKey] ?? true },
      { user_id: userId, institution_id: institutionId, channel: 'in_app', event_type: key, enabled: prefs[`in_app:${key}` as PrefKey] ?? true },
    ]);
    await supabase.from('ct_notification_prefs').upsert(rows, { onConflict: 'user_id,channel,event_type' });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Bell size={18} className="text-primary" />
        <h3 className="font-lexend font-700 text-lg text-on-surface dark:text-slate-100">Notification Preferences</h3>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2 text-xs font-jakarta font-700 text-on-surface-variant uppercase tracking-widest">
        <span>Notification</span>
        <span className="flex items-center gap-1 justify-center"><Mail size={12} /> Email</span>
        <span className="flex items-center gap-1 justify-center"><Bell size={12} /> In-App</span>
      </div>
      {eventTypes.map(({ key, label }) => (
        <div key={key} className="grid grid-cols-3 gap-2 items-center py-2 border-b border-outline-variant/20">
          <span className="text-sm font-jakarta text-on-surface dark:text-slate-200">{label}</span>
          <div className="flex justify-center">
            <button
              onClick={() => toggle('email', key)}
              className={`w-10 h-6 rounded-full transition-colors ${prefs[`email:${key}` as PrefKey] ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full mx-auto transition-transform ${prefs[`email:${key}` as PrefKey] ? 'translate-x-2' : '-translate-x-2'}`} />
            </button>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => toggle('in_app', key)}
              className={`w-10 h-6 rounded-full transition-colors ${prefs[`in_app:${key}` as PrefKey] ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full mx-auto transition-transform ${prefs[`in_app:${key}` as PrefKey] ? 'translate-x-2' : '-translate-x-2'}`} />
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={save}
        disabled={saving}
        className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-jakarta font-700 text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : saved ? 'Saved.' : 'Save Preferences'}
      </button>
    </div>
  );
}
