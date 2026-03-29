import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import { MapPin, Clock } from 'lucide-react';

interface Venue { id: string; name: string; capacity: number | null; location: string | null; is_bookable: boolean; }
interface Booking {
  id: string; venue_id: string; purpose: string; start_time: string; end_time: string;
  status: string; attendee_count: number | null; resources_requested: string[] | null; booked_by: string;
  venue?: { name: string } | null;
}

const RESOURCES = ['AV Equipment', 'Microphone', 'Chairs/Tables', 'Projector', 'Whiteboard', 'Catering Setup'];
const RECURRENCE_OPTIONS = ['none', 'weekly', 'biweekly'] as const;

export default function StudentRepVenues() {
  const { institutionId, user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [form, setForm] = useState({
    venue_id: '',
    date: '',
    start_time: '',
    end_time: '',
    purpose: '',
    attendee_count: 20,
    resources: [] as string[],
    recurrence: 'none' as (typeof RECURRENCE_OPTIONS)[number],
  });

  const load = async () => {
    if (!institutionId || !user) return;
    const [v, b] = await Promise.all([
      supabase.from('ct_venues').select('*').eq('institution_id', institutionId).eq('is_bookable', true),
      supabase.from('ct_venue_bookings').select('*, venue:ct_venues(name)').eq('booked_by', user.id).order('start_time', { ascending: true }),
    ]);
    setVenues(v.data ?? []);
    setMyBookings((b.data as Booking[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [institutionId, user]);

  const toggleResource = (r: string) => {
    setForm(f => ({ ...f, resources: f.resources.includes(r) ? f.resources.filter(x => x !== r) : [...f.resources, r] }));
  };

  const submitBooking = async () => {
    if (!form.venue_id || !form.date || !form.start_time || !form.end_time || !form.purpose || !user) return;
    setSubmitting(true);
    setSuccessMsg('');

    const dates: Date[] = [];
    const base = new Date(`${form.date}T${form.start_time}`);
    if (form.recurrence === 'none') {
      dates.push(base);
    } else if (form.recurrence === 'weekly') {
      for (let i = 0; i < 4; i++) {
        const d = new Date(base); d.setDate(d.getDate() + i * 7); dates.push(d);
      }
    } else if (form.recurrence === 'biweekly') {
      for (let i = 0; i < 4; i++) {
        const d = new Date(base); d.setDate(d.getDate() + i * 14); dates.push(d);
      }
    }

    const [endH, endM] = form.end_time.split(':').map(Number);
    const bookings = dates.map(start => {
      const end = new Date(start);
      end.setHours(endH, endM, 0, 0);
      return {
        venue_id: form.venue_id,
        purpose: form.purpose,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        attendee_count: form.attendee_count,
        resources_requested: form.resources.length > 0 ? form.resources : null,
        status: 'pending',
        booked_by: user.id,
        is_recurring: form.recurrence !== 'none',
        recurrence_weeks: form.recurrence === 'weekly' ? 1 : form.recurrence === 'biweekly' ? 2 : null,
      };
    });

    const { error } = await supabase.from('ct_venue_bookings').insert(bookings);
    setSubmitting(false);
    if (!error) {
      setSuccessMsg(`${bookings.length} booking(s) submitted for approval.`);
      setForm({ venue_id: '', date: '', start_time: '', end_time: '', purpose: '', attendee_count: 20, resources: [], recurrence: 'none' });
      load();
    }
  };

  const statusVariant = (s: string): 'success' | 'warning' | 'danger' | 'neutral' =>
    s === 'approved' ? 'success' : s === 'pending' ? 'warning' : s === 'rejected' ? 'danger' : 'neutral';

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Venue Booking</h1>

      {/* Venues list */}
      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Available Venues ({venues.length})</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {venues.map(v => (
            <Card key={v.id} className="flex items-start gap-3">
              <MapPin size={18} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-jakarta font-bold text-on-surface">{v.name}</p>
                {v.location && <p className="text-xs text-on-surface-variant">{v.location}</p>}
                {v.capacity && <p className="text-xs text-on-surface-variant">Capacity: {v.capacity}</p>}
                <Badge label="Available" variant="success" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking form */}
      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-4">Request a Booking</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-jakarta font-bold text-on-surface mb-1">Venue *</label>
            <select
              className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
              value={form.venue_id}
              onChange={e => setForm(f => ({ ...f, venue_id: e.target.value }))}
            >
              <option value="">Select venue...</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-jakarta font-bold text-on-surface mb-1">Date *</label>
              <input type="date" className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-jakarta font-bold text-on-surface mb-1">Start *</label>
              <input type="time" className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-jakarta font-bold text-on-surface mb-1">End *</label>
              <input type="time" className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-jakarta font-bold text-on-surface mb-1">Purpose *</label>
            <input className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
              value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Student council meeting" />
          </div>
          <div>
            <label className="block text-sm font-jakarta font-bold text-on-surface mb-1">Attendee Count</label>
            <input type="number" min={1} className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
              value={form.attendee_count} onChange={e => setForm(f => ({ ...f, attendee_count: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="block text-sm font-jakarta font-bold text-on-surface mb-2">Resource Requests</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RESOURCES.map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.resources.includes(r)} onChange={() => toggleResource(r)} />
                  <span className="font-jakarta text-sm text-on-surface">{r}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-jakarta font-bold text-on-surface mb-2">Recurring</label>
            <div className="flex gap-3">
              {RECURRENCE_OPTIONS.map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="recurrence" checked={form.recurrence === r} onChange={() => setForm(f => ({ ...f, recurrence: r }))} />
                  <span className="font-jakarta text-sm text-on-surface capitalize">
                    {r === 'none' ? 'None' : r === 'weekly' ? 'Weekly (4 weeks)' : 'Biweekly (8 weeks)'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          {successMsg && <p className="text-sm text-green-600 font-jakarta">{successMsg}</p>}
          <Button onClick={submitBooking} disabled={submitting || !form.venue_id || !form.date || !form.start_time || !form.end_time || !form.purpose}>
            {submitting ? 'Submitting...' : `Submit ${form.recurrence !== 'none' ? 'Recurring ' : ''}Booking Request`}
          </Button>
        </div>
      </Card>

      {/* My bookings */}
      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">My Bookings ({myBookings.length})</h2>
        {myBookings.length === 0 ? (
          <p className="text-on-surface-variant font-jakarta text-sm">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {myBookings.map(b => (
              <Card key={b.id} className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-jakarta font-bold text-on-surface">{b.purpose}</p>
                  <p className="text-xs text-on-surface-variant">{b.venue?.name || 'Venue'}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={12} className="text-on-surface-variant" />
                    <span className="text-xs text-on-surface-variant">
                      {b.start_time ? new Date(b.start_time).toLocaleString() : ''}
                    </span>
                  </div>
                  {b.resources_requested && b.resources_requested.length > 0 && (
                    <p className="text-xs text-on-surface-variant mt-1">Resources: {b.resources_requested.join(', ')}</p>
                  )}
                </div>
                <Badge label={b.status} variant={statusVariant(b.status)} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
