import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Venue { id: string; name: string; capacity: number | null; location: string | null; is_bookable: boolean; }

export default function StudentRepVenues() {
  const { user, institutionId } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingVenue, setBookingVenue] = useState<Venue | null>(null);
  const [form, setForm] = useState({ purpose: '', start_time: '', end_time: '', notes: '' });

  useEffect(() => {
    if (!institutionId) return;
    supabase.from('ct_venues').select('*').eq('institution_id', institutionId).eq('is_bookable', true)
      .then(({ data }) => { setVenues(data ?? []); setLoading(false); });
  }, [institutionId]);

  const submitBooking = async () => {
    if (!bookingVenue || !form.purpose || !user?.id) return;
    await supabase.from('ct_venue_bookings').insert({
      venue_id: bookingVenue.id, purpose: form.purpose,
      start_time: form.start_time || null, end_time: form.end_time || null,
      notes: form.notes, status: 'pending',
    });
    setBookingVenue(null);
    setForm({ purpose: '', start_time: '', end_time: '', notes: '' });
    alert('Booking submitted! Awaiting admin approval.');
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
            <div className="flex gap-3">
              <Button onClick={submitBooking} className="rounded-full">Submit Request</Button>
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
