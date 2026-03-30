import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { Send, Megaphone } from 'lucide-react';

interface Event {
  id: string; title: string; category: string | null; event_date: string | null; location: string | null; status: string;
}
interface Announcement {
  id: string; title: string; body: string | null; status: string; created_at: string;
}

const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30';

export default function AdminEvents() {
  const { user, institutionId } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({ title: '', event_date: '', location: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', body: '' });
  const [tab, setTab] = useState<'events' | 'announcements' | 'broadcast'>('events');
  const [broadcast, setBroadcast] = useState({ title: '', body: '', audience: 'all' });
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_events').select('*').eq('institution_id', institutionId).order('event_date', { ascending: true }),
      supabase.from('ct_announcements').select('*').eq('institution_id', institutionId).order('created_at', { ascending: false }),
    ]).then(([ev, an]) => {
      setEvents(ev.data ?? []);
      setAnnouncements(an.data ?? []);
      setLoading(false);
    });
  }, [institutionId]);

  const createEvent = async () => {
    if (!newEvent.title.trim() || !institutionId || !user?.id) return;
    const { data } = await supabase.from('ct_events')
      .insert({ ...newEvent, institution_id: institutionId, status: 'published' }).select('*').single();
    if (data) { setEvents([...events, data]); setNewEvent({ title: '', event_date: '', location: '' }); }
  };

  const createAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !institutionId || !user?.id) return;
    const { data } = await supabase.from('ct_announcements')
      .insert({ ...newAnnouncement, institution_id: institutionId, created_by: user.id, status: 'published' }).select('*').single();
    if (data) { setAnnouncements([data, ...announcements]); setNewAnnouncement({ title: '', body: '' }); }
  };

  const sendBroadcast = async () => {
    if (!broadcast.title.trim() || !broadcast.body.trim() || !institutionId || !user?.id) return;
    setBroadcasting(true);
    await supabase.from('ct_broadcast_notifications').insert({
      institution_id: institutionId, title: broadcast.title, body: broadcast.body,
      audience: broadcast.audience, created_by: user.id,
    });
    setBroadcasting(false);
    setBroadcastSent(true);
    setBroadcast({ title: '', body: '', audience: 'all' });
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Events & Announcements</h1>

      <div className="flex gap-2 border-b border-outline-variant/30 pb-2 flex-wrap">
        {(['events', 'announcements', 'broadcast'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full font-jakarta text-sm font-bold capitalize transition-colors ${tab === t ? 'bg-primary text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {t === 'broadcast' ? '📡 Broadcast' : t}
          </button>
        ))}
      </div>

      {tab === 'events' && (
        <div className="space-y-4">
          <Card>
            <h2 className="font-lexend font-bold text-on-surface mb-3">Create Event</h2>
            <div className="space-y-3">
              <input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title..." className={inputCls} />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={newEvent.event_date} onChange={e => setNewEvent({ ...newEvent, event_date: e.target.value })} className={inputCls} />
                <input value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="Location..." className={inputCls} />
              </div>
              <Button onClick={createEvent} className="rounded-full">Create Event</Button>
            </div>
          </Card>
          {events.length === 0 ? <EmptyState message="No events yet." /> : (
            <div className="space-y-3">
              {events.map(ev => (
                <Card key={ev.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-jakarta font-bold text-on-surface">{ev.title}</p>
                    <p className="text-sm text-on-surface-variant">{ev.event_date ? new Date(ev.event_date).toLocaleDateString() : 'Date TBD'} {ev.location ? `· ${ev.location}` : ''}</p>
                  </div>
                  <Badge label={ev.status} variant={ev.status === 'published' ? 'success' : 'neutral'} />
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'announcements' && (
        <div className="space-y-4">
          <Card>
            <h2 className="font-lexend font-bold text-on-surface mb-3">Create Announcement</h2>
            <div className="space-y-3">
              <input value={newAnnouncement.title} onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })} placeholder="Title..." className={inputCls} />
              <textarea value={newAnnouncement.body} onChange={e => setNewAnnouncement({ ...newAnnouncement, body: e.target.value })} placeholder="Body..." rows={3} className={`${inputCls} resize-none`} />
              <Button onClick={createAnnouncement} className="rounded-full">Post Announcement</Button>
            </div>
          </Card>
          {announcements.length === 0 ? <EmptyState message="No announcements yet." /> : (
            <div className="space-y-3">
              {announcements.map(a => (
                <Card key={a.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-jakarta font-bold text-on-surface">{a.title}</p>
                      {a.body && <p className="text-sm text-on-surface-variant mt-1">{a.body}</p>}
                    </div>
                    <Badge label={a.status} variant={a.status === 'published' ? 'success' : 'neutral'} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'broadcast' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={18} className="text-primary" />
            <h2 className="font-lexend font-bold text-on-surface">Broadcast Notification</h2>
          </div>
          <p className="text-sm text-on-surface-variant font-jakarta mb-4">Send an in-app notification to all users or a specific audience.</p>
          <div className="space-y-3">
            <div>
              <label className="font-jakarta text-xs font-700 text-on-surface-variant uppercase tracking-widest mb-1 block">Audience</label>
              <select value={broadcast.audience} onChange={e => setBroadcast({ ...broadcast, audience: e.target.value })} className={inputCls}>
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="teachers">Teachers Only</option>
                <option value="staff">Staff Only</option>
                <option value="parents">Parents Only</option>
              </select>
            </div>
            <input value={broadcast.title} onChange={e => setBroadcast({ ...broadcast, title: e.target.value })} placeholder="Notification title..." className={inputCls} />
            <textarea value={broadcast.body} onChange={e => setBroadcast({ ...broadcast, body: e.target.value })} placeholder="Notification body..." rows={4} className={`${inputCls} resize-none`} />
            {broadcastSent && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 font-jakarta">Broadcast sent successfully!</div>}
            <Button onClick={sendBroadcast} isLoading={broadcasting} className="rounded-full flex items-center gap-2">
              <Send size={14} />
              Send Broadcast
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
