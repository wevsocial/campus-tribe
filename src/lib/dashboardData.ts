export type VenueBookingLike = {
  id: string;
  venue_id: string | null;
  start_time: string;
  end_time: string;
  status: string;
  purpose?: string | null;
  notes?: string | null;
  approved_by?: string | null;
  ct_venues?: { name?: string | null; building?: string | null; institution_id?: string | null } | null;
};

export function normalizeRelation<T>(input: T | T[] | null | undefined): T | null {
  if (Array.isArray(input)) return input[0] ?? null;
  return input ?? null;
}

export function hasTimeOverlap(startA: string, endA: string, startB: string, endB: string) {
  return new Date(startA).getTime() < new Date(endB).getTime() && new Date(endA).getTime() > new Date(startB).getTime();
}

export function findVenueConflicts(bookings: VenueBookingLike[], candidate: { venueId?: string | null; start?: string; end?: string; excludeId?: string | null }) {
  if (!candidate.venueId || !candidate.start || !candidate.end) return [];
  const { venueId, start, end, excludeId } = candidate;
  return bookings.filter((booking) => booking.id !== excludeId
    && booking.venue_id === venueId
    && booking.status !== 'rejected'
    && booking.status !== 'cancelled'
    && hasTimeOverlap(start, end, booking.start_time, booking.end_time));
}

export function formatDateTimeLocalInput(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function summarizeVenueConflicts(bookings: VenueBookingLike[], candidate: { venueId?: string | null; start?: string; end?: string; excludeId?: string | null }) {
  const conflicts = findVenueConflicts(bookings, candidate);
  const approved = conflicts.filter((booking) => booking.status === 'approved').length;
  const pending = conflicts.filter((booking) => booking.status === 'pending').length;
  const live = conflicts.filter((booking) => booking.status !== 'approved' && booking.status !== 'pending').length;
  return {
    conflicts,
    approved,
    pending,
    live,
    label: conflicts.length === 0
      ? 'No known conflicts for this request.'
      : `${conflicts.length} overlapping request${conflicts.length === 1 ? '' : 's'} found · ${approved} approved · ${pending} pending${live ? ` · ${live} active` : ''}`,
  };
}
