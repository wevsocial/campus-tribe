import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Event {
  id: string;
  title: string;
  category: string | null;
  event_date: string | null;
  start_time: string | null;
  location: string | null;
  capacity: number | null;
}

export default function StudentEvents() {
  const { user, institutionId } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvpIds, setRsvpIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!institutionId || !user?.id) return;
    Promise.all([
      supabase.from('ct_events').select('*').eq('institution_id', institutionId).eq('status', 'published').order('event_date', { ascending: true }),
      supabase.from('ct_event_rsvps').select('event_id').eq('user_id', user.id).eq('status', 'confirmed'),
    ]).then(([ev, rv]) => {
      setEvents(ev.data ?? []);
      setRsvpIds(new Set((rv.data ?? []).map((r: { event_id: string }) => r.event_id)));
      setLoading(false);
    });
  }, [institutionId, user?.id]);

  const rsvp = async (eventId: string) => {
    if (!user?.id) return;
    const isRsvped = rsvpIds.has(eventId);
    if (isRsvped) {
      await supabase.from('ct_event_rsvps').delete().eq('event_id', eventId).eq('user_id', user.id);
      const next = new Set(rsvpIds);
      next.delete(eventId);
      setRsvpIds(next);
    } else {
      await supabase.from('ct_event_rsvps').upsert({ event_id: eventId, user_id: user.id, status: 'confirmed' });
      setRsvpIds(new Set([...rsvpIds, eventId]));
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Events</h1>
        <Badge label={`${rsvpIds.size} RSVPs`} variant="primary" />
      </div>

      {events.length === 0 ? (
        <EmptyState message="No upcoming events right now." />
      ) : (
        <div className="space-y-3">
          {events.map(ev => {
            const isRsvped = rsvpIds.has(ev.id);
            return (
              <Card key={ev.id} className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary-container rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  {ev.event_date ? (
                    <>
                      <span className="font-lexend font-bold text-primary text-lg leading-none">
                        {new Date(ev.event_date).getDate()}
                      </span>
                      <span className="font-jakarta text-primary text-xs">
                        {new Date(ev.event_date).toLocaleDateString('en', { month: 'short' })}
                      </span>
                    </>
                  ) : <span className="text-on-surface-variant text-xs">TBD</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-jakarta font-bold text-on-surface">{ev.title}</p>
                  <p className="text-sm text-on-surface-variant">
                    {ev.location || 'Campus'} {ev.start_time ? `· ${ev.start_time}` : ''}
                  </p>
                  {ev.category && <Badge label={ev.category} variant="neutral" size="sm" />}
                </div>
                <Button
                  size="sm"
                  variant={isRsvped ? 'outline' : 'primary'}
                  onClick={() => rsvp(ev.id)}
                  className="rounded-full flex-shrink-0"
                >
                  {isRsvped ? '✓ Going' : 'RSVP'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
      <div className="mt-4 p-4 rounded-2xl bg-surface-low border border-outline-variant/20 text-center">
        <p className="text-xs text-on-surface-variant font-jakarta">📍 QR code check-in available at the event venue. Show your student ID QR at the door to check in automatically.</p>
      </div>
    </div>
  );
}
