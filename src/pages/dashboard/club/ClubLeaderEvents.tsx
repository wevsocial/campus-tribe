import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Event { id: string; title: string; event_date: string | null; location: string | null; status: string; }

export default function ClubLeaderEvents() {
  const { user, institutionId } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', event_date: '', location: '' });

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_events').select('id,title,event_date,location,status').eq('institution_id', institutionId).order('event_date', { ascending: true })
      .then(({ data }) => { setEvents(data ?? []); setLoading(false); });
  }, [institutionId]);

  const createEvent = async () => {
    if (!form.title.trim() || !institutionId) return;
    const { data } = await supabase.from('ct_events')
      .insert({ ...form, institution_id: institutionId, status: 'published', category: 'Club' })
      .select('id,title,event_date,location,status').single();
    if (data) { setEvents([...events, data]); setForm({ title: '', event_date: '', location: '' }); }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Club Events</h1>
      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Create Event</h2>
        <div className="space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title"
            className="w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })}
              className="px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm focus:outline-none" />
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location"
              className="px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm focus:outline-none" />
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
                <p className="text-sm text-on-surface-variant">{ev.event_date ? new Date(ev.event_date).toLocaleDateString() : 'TBD'} · {ev.location || 'TBD'}</p>
              </div>
              <Badge label={ev.status} variant={ev.status === 'published' ? 'success' : 'neutral'} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
