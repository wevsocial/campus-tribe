import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Event {
  id: string; title: string; description: string | null; category: string | null;
  start_time: string | null; event_date: string | null; location: string | null;
  status: string; capacity: number | null;
}

const CATEGORY_EMOJI: Record<string, string> = {
  sports: 'trophy', academic: 'book', arts: 'palette', social: 'star', career: 'briefcase', wellness: 'heart', club: 'building',
};

export default function StudentEvents() {
  const { user, institutionId } = useAuth();
  const [events, setEvents]     = useState<Event[]>([]);
  const [myRsvps, setMyRsvps]   = useState<Set<string>>(new Set());
  const [filter, setFilter]     = useState('all');
  const [loading, setLoading]   = useState(true);
  const [flash, setFlash]       = useState('');

  useEffect(() => {
    if (!institutionId || !user?.id) return;
    Promise.all([
      supabase.from('ct_events').select('*')
        .eq('institution_id', institutionId)
        .in('status', ['active', 'published'])
        .order('start_time', { ascending: true })
        .limit(30),
      supabase.from('ct_event_rsvps').select('event_id').eq('user_id', user.id),
    ]).then(([ev, rv]) => {
      setEvents(ev.data ?? []);
      setMyRsvps(new Set((rv.data ?? []).map((r: { event_id: string }) => r.event_id)));
      setLoading(false);
    });
  }, [institutionId, user?.id]);

  const rsvp = async (eventId: string) => {
    if (!user?.id || myRsvps.has(eventId)) return;
    const { error } = await supabase.from('ct_event_rsvps')
      .insert({ event_id: eventId, user_id: user.id, status: 'going' });
    if (!error) {
      setMyRsvps(new Set([...myRsvps, eventId]));
      showFlash('RSVP confirmed! You\'ll get a reminder before the event. 🎉');
    }
  };

  const cancelRsvp = async (eventId: string) => {
    if (!user?.id) return;
    await supabase.from('ct_event_rsvps').delete().eq('event_id', eventId).eq('user_id', user.id);
    const next = new Set(myRsvps); next.delete(eventId);
    setMyRsvps(next);
    showFlash('RSVP cancelled.');
  };

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 3500); };

  const categories = ['all', ...Array.from(new Set(events.map(e => e.category).filter((c): c is string => c !== null)))];
  const filtered = filter === 'all' ? events : events.filter(e => e.category === filter);

  const formatDate = (t: string | null) => {
    if (!t) return 'TBD';
    return new Date(t).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Events</h1>
        <Badge label={`${myRsvps.size} RSVPs`} variant="primary" />
      </div>

      {flash && (
        <div className="bg-primary-container text-primary rounded-2xl px-4 py-3 text-sm font-jakarta font-bold">{flash}</div>
      )}

      {/* Category filter chips */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-jakarta font-bold transition-all ${
              filter === cat ? 'bg-primary text-white' : 'bg-surface-low text-on-surface-variant hover:bg-primary-container'
            }`}>
            {cat === 'all' ? 'All' : `$<Calendar size={14} className="inline text-gray-400" /> ${cat}`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={undefined} message="No events in this category." />
      ) : (
        <div className="space-y-4">
          {filtered.map(ev => {
            const isGoing = myRsvps.has(ev.id);
            return (
              <Card key={ev.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">
                    <Calendar size={14} className="inline text-gray-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-jakarta font-bold text-on-surface">{ev.title}</p>
                    {ev.description && <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-1">{ev.description}</p>}
                    <p className="text-sm text-on-surface-variant mt-1">
                       {formatDate(ev.start_time || ev.event_date)}
                      {ev.location && ` ·  ${ev.location}`}
                      {ev.capacity && ` · Capacity: ${ev.capacity}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {ev.category && <Badge label={ev.category} variant="secondary" />}
                  {isGoing ? (
                    <>
                      <Badge label="Going ✓" variant="success" />
                      <Button size="sm" variant="outline" onClick={() => cancelRsvp(ev.id)} className="rounded-full">Cancel</Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => rsvp(ev.id)} className="rounded-full">RSVP</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
