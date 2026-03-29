import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { LoadingSkeleton } from '../../../components/ui/LoadingSkeleton';
import EmptyState from '../../../components/ui/EmptyState';

interface Booking {
  id: string;
  purpose: string | null;
  status: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
  venue_id: string | null;
  venue?: { name: string } | null;
}

export default function AdminVenues() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('ct_venue_bookings')
      .select('*, venue:ct_venues(name)')
      .order('start_time', { ascending: true })
      .then(({ data }) => { setBookings((data as Booking[]) ?? []); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('ct_venue_bookings').update({ status }).eq('id', id);
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  if (loading) return <LoadingSkeleton />;

  const pending = bookings.filter(b => b.status === 'pending');
  const confirmed = bookings.filter(b => b.status === 'confirmed' || b.status === 'approved');
  const others = bookings.filter(b => !['pending', 'confirmed', 'approved'].includes(b.status));

  const statusVariant = (s: string) => s === 'confirmed' || s === 'approved' ? 'success' : s === 'pending' ? 'warning' : 'danger';

  const renderBooking = (b: Booking, showActions = false) => (
    <Card key={b.id} className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-jakarta font-bold text-on-surface truncate">{b.purpose || 'No purpose stated'}</p>
        <p className="text-sm text-on-surface-variant">{b.venue?.name || 'Unknown venue'}</p>
        {b.start_time && (
          <p className="text-xs text-on-surface-variant mt-1">
            {new Date(b.start_time).toLocaleString()} {b.end_time ? `→ ${new Date(b.end_time).toLocaleTimeString()}` : ''}
          </p>
        )}
        {b.notes && <p className="text-xs text-on-surface-variant italic mt-1">{b.notes}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge label={b.status} variant={statusVariant(b.status) as 'success' | 'warning' | 'danger'} />
        {showActions && (
          <>
            <Button size="sm" onClick={() => updateStatus(b.id, 'approved')} className="rounded-full">Approve</Button>
            <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'rejected')} className="rounded-full">Reject</Button>
          </>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Venue Bookings</h1>

      <div>
        <h2 className="font-lexend font-bold text-on-surface mb-3">Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <EmptyState icon="✅" message="No pending bookings." />
        ) : (
          <div className="space-y-3">{pending.map(b => renderBooking(b, true))}</div>
        )}
      </div>

      {confirmed.length > 0 && (
        <div>
          <h2 className="font-lexend font-bold text-on-surface mb-3">Approved ({confirmed.length})</h2>
          <div className="space-y-3">{confirmed.map(b => renderBooking(b, false))}</div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <h2 className="font-lexend font-bold text-on-surface mb-3">Other ({others.length})</h2>
          <div className="space-y-3">{others.map(b => renderBooking(b, false))}</div>
        </div>
      )}
    </div>
  );
}
