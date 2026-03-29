import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import { StatSkeleton, LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';

interface FeedEvent {
  id: string;
  title: string;
  event_date: string | null;
  location: string | null;
  category: string | null;
}

interface FeedAnnouncement {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
}

export default function StudentHome() {
  const { user, institutionId } = useAuth();
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [announcements, setAnnouncements] = useState<FeedAnnouncement[]>([]);
  const [clubCount, setClubCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const displayName = (user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Student';

  useEffect(() => {
    if (!institutionId) return;
    Promise.all([
      supabase.from('ct_events').select('id,title,event_date,location,category').eq('institution_id', institutionId).eq('status', 'published').order('event_date', { ascending: true }).limit(5),
      supabase.from('ct_announcements').select('id,title,body,created_at').eq('institution_id', institutionId).eq('status', 'published').order('created_at', { ascending: false }).limit(5),
      supabase.from('ct_clubs').select('id', { count: 'exact' }).eq('institution_id', institutionId).eq('is_approved', true),
    ]).then(([ev, an, cl]) => {
      setEvents(ev.data ?? []);
      setAnnouncements(an.data ?? []);
      setClubCount(cl.count ?? 0);
      setLoading(false);
    });
  }, [institutionId]);

  if (loading) return <div className="space-y-6"><StatSkeleton /><LoadingSkeleton rows={3} /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-2xl p-6 text-white">
        <p className="font-jakarta text-sm opacity-80">Welcome back,</p>
        <h1 className="font-lexend text-2xl font-extrabold">{displayName} 👋</h1>
        <p className="font-jakarta text-sm opacity-70 mt-1">Here's what's happening on campus today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value={events.length} label="Upcoming Events" icon="event" color="primary" />
        <StatCard value={clubCount} label="Active Clubs" icon="groups" color="secondary" />
        <StatCard value={announcements.length} label="New Announcements" icon="campaign" color="tertiary" />
      </div>

      {announcements.length > 0 && (
        <div>
          <h2 className="font-lexend font-bold text-on-surface mb-3">Announcements</h2>
          <div className="space-y-3">
            {announcements.map(a => (
              <Card key={a.id} variant="primary-tinted">
                <p className="font-jakarta font-bold text-on-surface">{a.title}</p>
                {a.body && <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{a.body}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Upcoming Events</h2>
        {events.length === 0 ? (
          <Card><p className="text-on-surface-variant font-jakarta text-sm text-center py-4">No upcoming events</p></Card>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <Card key={ev.id} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-lexend font-bold text-xs text-center">
                    {ev.event_date ? new Date(ev.event_date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-jakarta font-bold text-on-surface truncate">{ev.title}</p>
                  <p className="text-sm text-on-surface-variant">{ev.location || 'Campus'}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
