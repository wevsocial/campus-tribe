import React, { useEffect, useState } from 'react';
import { BookOpen, Home as HomeIcon, Search, Calendar, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { StatSkeleton, LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';

interface FeedEvent { id: string; title: string; start_time: string | null; event_date: string | null; location: string | null; category: string | null; }
interface Announcement { id: string; title: string; body: string | null; created_at: string; }
interface Club { id: string; name: string; category: string | null; }

const CATEGORY_EMOJI: Record<string, string> = { sports: 'trophy', academic: 'book', arts: 'palette', social: 'star', career: 'briefcase', wellness: 'heart', club: 'building', default: 'calendar' };

export default function StudentHome() {
  const { user, institutionId, profile } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents]               = useState<FeedEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [myClubs, setMyClubs]             = useState<Club[]>([]);
  const [loading, setLoading]             = useState(true);

  const displayName = (profile as { full_name?: string })?.full_name
    || (user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name
    || user?.email?.split('@')[0] || 'Student';

  useEffect(() => {
    if (!institutionId || !user?.id) return;
    Promise.all([
      supabase.from('ct_events').select('id,title,start_time,event_date,location,category')
        .eq('institution_id', institutionId)
        .in('status', ['active', 'published'])
        .order('start_time', { ascending: true })
        .limit(6),
      supabase.from('ct_announcements').select('id,title,body,created_at')
        .eq('institution_id', institutionId)
        .in('status', ['active', 'published'])
        .order('created_at', { ascending: false })
        .limit(3),
      supabase.from('ct_club_members').select('club_id, ct_clubs(id,name,category)')
        .eq('user_id', user.id)
        .limit(5),
    ]).then(([ev, an, mem]) => {
      setEvents(ev.data ?? []);
      setAnnouncements(an.data ?? []);
      const clubs = (mem.data ?? []).map((m: any) => m.ct_clubs).filter(Boolean);
      setMyClubs(clubs);
      setLoading(false);
    });
  }, [institutionId, user?.id]);

  if (loading) return <div className="space-y-6"><StatSkeleton /><LoadingSkeleton rows={3} /></div>;

  const formatDate = (t: string | null) => {
    if (!t) return 'TBD';
    const d = new Date(t);
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Hero welcome */}
      <div className="relative rounded-2xl overflow-hidden p-6 text-white" style={{ background: 'linear-gradient(135deg,#0047AB,#3A6FD0)' }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 translate-x-12 -translate-y-12" />
        <div className="relative z-10">
          <p className="font-jakarta text-white/70 text-sm">Welcome back,</p>
          <h1 className="font-lexend font-black text-3xl mt-0.5">{displayName} 👋</h1>
          <p className="font-jakarta text-white/70 text-sm mt-1">Here's your campus life today.</p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <Button onClick={() => navigate('/dashboard/student/discover')} size="sm" className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0 font-jakarta font-bold">
              Discover Clubs
            </Button>
            <Button onClick={() => navigate('/dashboard/student/events')} size="sm" className="rounded-full bg-white/20 hover:bg-white/30 text-white border-0 font-jakarta font-bold">
              Browse Events
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard value={events.length} label="Upcoming Events" color="primary" />
        <StatCard value={myClubs.length} label="My Clubs" color="secondary" />
        <StatCard value={announcements.length} label="Announcements" color="tertiary" />
      </div>

      {/* My clubs quick view */}
      {myClubs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-lexend font-bold text-on-surface">My Clubs</h2>
            <button onClick={() => navigate('/dashboard/student/discover')} className="text-sm text-primary font-jakarta font-bold hover:underline">View all →</button>
          </div>
          <div className="flex gap-3 flex-wrap">
            {myClubs.map((c) => (
              <div key={c.id} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container">
                <span className="text-sm"><Calendar size={14} className="inline text-gray-400" /></span>
                <span className="font-jakarta font-bold text-sm text-primary">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <div>
          <h2 className="font-lexend font-bold text-on-surface mb-3">Announcements</h2>
          <div className="space-y-3">
            {announcements.map(a => (
              <Card key={a.id} className="border-l-4 border-primary">
                <p className="font-jakarta font-bold text-on-surface">{a.title}</p>
                {a.body && <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">{a.body}</p>}
                <p className="text-xs text-on-surface-variant mt-1">{new Date(a.created_at).toLocaleDateString()}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming events feed */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-lexend font-bold text-on-surface">Upcoming Events</h2>
          <button onClick={() => navigate('/dashboard/student/events')} className="text-sm text-primary font-jakarta font-bold hover:underline">View all →</button>
        </div>
        {events.length === 0 ? (
          <Card><p className="text-on-surface-variant font-jakarta text-sm text-center py-6">No upcoming events yet. Check back soon!</p></Card>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <Card key={ev.id} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                  <Calendar size={14} className="inline text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-jakarta font-bold text-on-surface truncate">{ev.title}</p>
                  <p className="text-sm text-on-surface-variant">{formatDate(ev.start_time || ev.event_date)} · {ev.location || 'Campus'}</p>
                </div>
                {ev.category && <Badge label={ev.category} variant="secondary" />}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Campus Boards */}
      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">📌 Campus Boards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: 'home', label: 'Housing', desc: 'Find roommates, sublets, off-campus housing', color: 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800' },
            { icon: '🚗', label: 'Rides',   desc: 'Carpool, share rides, post your route',        color: 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800' },
            { icon: 'book', label: 'Study Groups', desc: 'Join or start a study group',             color: 'bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800' },
          ].map(b => (
            <div key={b.label} className={`p-4 rounded-2xl ${b.color} cursor-pointer hover:shadow-sm transition-shadow`}>
              <span className="text-2xl">{b.icon}</span>
              <p className="font-jakarta font-bold text-on-surface text-sm mt-2">{b.label}</p>
              <p className="text-xs text-on-surface-variant font-jakarta mt-1 leading-relaxed">{b.desc}</p>
              <span className="text-xs text-primary font-jakarta font-bold mt-2 inline-block">Browse →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
