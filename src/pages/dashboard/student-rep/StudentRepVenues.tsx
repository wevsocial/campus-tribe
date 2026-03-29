import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { RefreshCw, Monitor } from 'lucide-react';

interface Venue { id: string; name: string; capacity: number | null; location: string | null; is_bookable: boolean; }

const RESOURCES = ['Projector/AV', 'Microphone', 'Chairs (extra)', 'Tables', 'Whiteboard', 'Video conferencing', 'PA System'];

export default function StudentRepVenues() {
  const { user, institutionId } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null);
  const [form, setForm] = useState({ purpose: '', start_time: '', end_time: '', notes: '' });
  const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'biweekly'>('none');
  const [recurrenceWeeks, setRecurrenceWeeks] = useState(4);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_venues').select('*').eq('institution_id', institutionId).eq('is_bookable', true)
      .then(({ data }) => { setVenues(data ?? []); setLoading(false); });
  }, [institutionId]);

  const toggleResource = (r: string) => {
    setSelectedResources(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  const submitBooking = async () => {
    if (!bookingVenue || !form.purpose || !user?.id) return;
    setSubmitting(true);

    const baseBooking = {
      venue_id: bookingVenue.id, purpose: form.purpose,
      start_time: form.start_time || null, end_time: form.end_time || null,
      notes: form.notes, status: 'pending',
      resources_requested: selectedResources.length ? { items: selectedResources } : {},
      is_recurring: recurrence !== 'none',
      recurrence_weeks: recurrence !== 'none' ? recurrenceWeeks : 1,
    };

    if (recurrence === 'none') {
      await supabase.from('ct_venue_bookings').insert(baseBooking);
    } else {
      const intervalMs = recurrence === 'weekly' ? 7 * 24 * 60 * 60 * 1000 : 14 * 24 * 60 * 60 * 1000;
      const bookings = [];
      for (let i = 0; i < recurrenceWeeks; i++) {
        const offset = i * intervalMs;
        bookings.push({
          ...baseBooking,
          start_time: form.start_time ? new Date(new Date(form.start_time).getTime() + offset).toISOString() : null,
          end_time: form.end_time ? new Date(new Date(form.end_time).getTime() + offset).toISOString() : null,
        });
      }
      await supabase.from('ct_venue_bookings').insert(bookings);
    }

    setSubmitting(false);
    setBookingVenue(null);
    setForm({ purpose: '', start_time: '', end_time: '', notes: '' });
    setRecurrence('none');
    setSelectedResources([]);
    alert(`${recurrence !== 'none' ? recurrenceWeeks + ' bookings' : 'Booking'} submitted! Awaiting admin approval.`);
  };

  if (loading) return <LoadingSkeleton />;

  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none';

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Book a Venue</h1>

      {bookingVenue && (
        <Card variant="primary-tinted">
          <h2 className="font-lexend font-bold text-on-surface mb-3">Booking: {bookingVenue.name}</h2>
          <div className="space-y-3">
            <input value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} placeholder="Purpose" className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input type="datetime-local" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className={inputCls} />
              <input type="datetime-local" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className={inputCls} />
            </div>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notes (optional)" rows={2} className={`${inputCls} resize-none`} />

            {/* Resource requests — Module 10 */}
            <div>
              <p className="font-jakarta text-xs font-700 text-on-surface-variant uppercase tracking-widest mb-2">
                <Monitor size={12} className="inline mr-1" />Resource Requests
              </p>
              <div className="flex flex-wrap gap-2">
                {RESOURCES.map(r => (
                  <button key={r} type="button" onClick={() => toggleResource(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-jakarta font-700 border-2 transition-all ${
                      selectedResources.includes(r) ? 'bg-primary border-primary text-white' : 'border-outline-variant/50 text-on-surface-variant hover:border-primary/40'
                    }`}
                  >{r}</button>
                ))}
              </div>
            </div>

            {/* Recurring booking — Module 10 */}
            <div>
              <p className="font-jakarta text-xs font-700 text-on-surface-variant uppercase tracking-widest mb-2">
                <RefreshCw size={12} className="inline mr-1" />Recurring Booking
              </p>
              <div className="flex gap-2">
                {(['none', 'weekly', 'biweekly'] as const).map(r => (
                  <button key={r} type="button" onClick={() => setRecurrence(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-jakarta font-700 border-2 transition-all capitalize ${
                      recurrence === r ? 'bg-secondary border-secondary text-white' : 'border-outline-variant/50 text-on-surface-variant hover:border-secondary/40'
                    }`}
                  >{r}</button>
                ))}
              </div>
              {recurrence !== 'none' && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-jakarta text-on-surface-variant">Repeat for</span>
                  <input type="number" value={recurrenceWeeks} onChange={e => setRecurrenceWeeks(parseInt(e.target.value) || 4)} min={2} max={16}
                    className="w-16 px-3 py-1.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm text-on-surface focus:outline-none text-center" />
                  <span className="text-xs font-jakarta text-on-surface-variant">weeks</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={submitBooking} isLoading={submitting} className="rounded-full">
                {recurrence !== 'none' ? `Submit ${recurrenceWeeks} Bookings` : 'Submit Request'}
              </Button>
              <Button variant="outline" onClick={() => setBookingVenue(null)} className="rounded-full">Cancel</Button>
            </div>
          </div>
        </Card>
      )}

      {venues.length === 0 ? <EmptyState icon="🏟️" message="No bookable venues available." /> : (
        <div className="space-y-3">
          {venues.map(v => (
            <Card key={v.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="font-jakarta font-bold text-on-surface">{v.name}</p>
                <p className="text-sm text-on-surface-variant">{v.location} · Capacity: {v.capacity || 'Unknown'}</p>
              </div>
              <Button size="sm" onClick={() => setBookingVenue(v)} className="rounded-full">Book</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
