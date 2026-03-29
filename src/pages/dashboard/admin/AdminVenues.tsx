import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton, StatSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';
import { BarChart2, Plus } from 'lucide-react';

interface Venue { id: string; name: string; capacity: number | null; location: string | null; is_bookable: boolean; }
interface Booking {
  id: string; purpose: string | null; status: string; start_time: string | null;
  end_time: string | null; venue_id: string | null;
  venue?: { name: string } | null;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminVenues() {
  const { institutionId } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', capacity: 50 });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!institutionId) return;
    const [v, b] = await Promise.all([
      supabase.from('ct_venues').select('*').eq('institution_id', institutionId),
      supabase.from('ct_venue_bookings').select('*, venue:ct_venues(name)').order('start_time', { ascending: true }),
    ]);
    setVenues(v.data ?? []);
    setBookings((b.data as Booking[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [institutionId]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('ct_venue_bookings').update({ status }).eq('id', id);
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  const toggleBookable = async (venue: Venue) => {
    await supabase.from('ct_venues').update({ is_bookable: !venue.is_bookable }).eq('id', venue.id);
    setVenues(venues.map(v => v.id === venue.id ? { ...v, is_bookable: !v.is_bookable } : v));
  };

  const createVenue = async () => {
    if (!form.name || !institutionId) return;
    setSaving(true);
    const { data } = await supabase.from('ct_venues').insert({
      name: form.name, location: form.location || null, capacity: form.capacity,
      institution_id: institutionId, is_bookable: true,
    }).select().single();
    setSaving(false);
    if (data) {
      setVenues(prev => [...prev, data]);
      setForm({ name: '', location: '', capacity: 50 });
      setShowCreate(false);
    }
  };

  const dayCount = DAYS.map((_, idx) =>
    bookings.filter(b => b.start_time && new Date(b.start_time).getDay() === idx).length
  );
  const maxCount = Math.max(...dayCount, 1);

  const statusVariant = (s: string): 'success' | 'warning' | 'danger' | 'neutral' =>
    s === 'approved' ? 'success' : s === 'pending' ? 'warning' : s === 'rejected' ? 'danger' : 'neutral';

  if (loading) return <div className="space-y-6"><StatSkeleton /><LoadingSkeleton /></div>;

  const pending = bookings.filter(b => b.status === 'pending');
  const approved = bookings.filter(b => b.status === 'approved');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Venue Management</h1>
        <Button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2">
          <Plus size={16} /> Add Venue
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard value={venues.length} label="Total Venues" color="primary" />
        <StatCard value={approved.length} label="Approved Bookings" color="tertiary" />
        <StatCard value={pending.length} label="Pending Bookings" color="danger" />
      </div>

      {/* Create venue form */}
      {showCreate && (
        <Card>
          <h2 className="font-lexend font-bold text-on-surface mb-4">New Venue</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-jakarta text-on-surface-variant mb-1">Name *</label>
              <input className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Main Gymnasium" />
            </div>
            <div>
              <label className="block text-sm font-jakarta text-on-surface-variant mb-1">Location</label>
              <input className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Building A, Floor 2" />
            </div>
            <div>
              <label className="block text-sm font-jakarta text-on-surface-variant mb-1">Capacity</label>
              <input type="number" className="w-full border border-outline-variant rounded-xl px-4 py-2 text-on-surface bg-surface-lowest"
                value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={createVenue} disabled={saving || !form.name}>{saving ? 'Saving...' : 'Add Venue'}</Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* Utilization chart */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={18} className="text-primary" />
          <h2 className="font-lexend font-bold text-on-surface">Utilization by Day of Week</h2>
        </div>
        <div className="flex items-end gap-2 h-28">
          {DAYS.map((day, idx) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-jakarta text-on-surface-variant">{dayCount[idx]}</span>
              <div className="w-full rounded-t-lg bg-primary/80 transition-all" style={{ height: `${Math.max(4, (dayCount[idx] / maxCount) * 80)}px` }} />
              <span className="text-xs font-jakarta text-on-surface-variant">{day}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Pending queue */}
      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Pending Approvals ({pending.length})</h2>
        {pending.length === 0 ? (
          <EmptyState message="No pending bookings." />
        ) : (
          <div className="space-y-3">
            {pending.map(b => (
              <Card key={b.id} className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-jakarta font-bold text-on-surface">{b.purpose || 'No purpose'}</p>
                  <p className="text-sm text-on-surface-variant">{b.venue?.name || 'Unknown venue'}</p>
                  {b.start_time && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      {new Date(b.start_time).toLocaleString()} {b.end_time ? `→ ${new Date(b.end_time).toLocaleTimeString()}` : ''}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge label={b.status} variant={statusVariant(b.status)} />
                  <Button size="sm" onClick={() => updateStatus(b.id, 'approved')}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'rejected')}>Reject</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* All venues with toggle */}
      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">All Venues</h2>
        {venues.length === 0 ? <EmptyState message="No venues configured." /> : (
          <div className="space-y-3">
            {venues.map(v => (
              <Card key={v.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-jakarta font-bold text-on-surface">{v.name}</p>
                  {v.location && <p className="text-sm text-on-surface-variant">{v.location}</p>}
                  {v.capacity && <p className="text-xs text-on-surface-variant">Capacity: {v.capacity}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={v.is_bookable ? 'Bookable' : 'Closed'} variant={v.is_bookable ? 'success' : 'neutral'} />
                  <Button size="sm" variant="outline" onClick={() => toggleBookable(v)}>
                    {v.is_bookable ? 'Close' : 'Open'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approved bookings */}
      {approved.length > 0 && (
        <div>
          <h2 className="font-lexend font-bold text-on-surface mb-3">Approved Bookings ({approved.length})</h2>
          <div className="space-y-3">
            {approved.slice(0, 10).map(b => (
              <Card key={b.id} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-jakarta font-bold text-on-surface">{b.purpose || 'Booking'}</p>
                  <p className="text-sm text-on-surface-variant">{b.venue?.name}</p>
                  {b.start_time && <p className="text-xs text-on-surface-variant mt-1">{new Date(b.start_time).toLocaleString()}</p>}
                </div>
                <Badge label="approved" variant="success" />
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
