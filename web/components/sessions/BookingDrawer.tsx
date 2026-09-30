'use client';

import { useState } from 'react';
import { SessionDTO, bookingsApi, ApiClientError } from '@/lib/api/sessions';
import { sessionCategoryLabels } from '@/lib/validators/session.schema';

type BookingState = 'idle' | 'booking' | 'booked' | 'waitlisted' | 'error';

export function BookingDrawer({
  session, existingBookingId, onClose, onBookingChange,
}: {
  session: SessionDTO;
  existingBookingId?: string;
  onClose: () => void;
  onBookingChange?: (delta: 1 | -1) => void;
}) {
  const [state, setState] = useState<BookingState>(existingBookingId ? 'booked' : 'idle');
  const [bookingId, setBookingId] = useState(existingBookingId);
  const [error, setError] = useState<string | null>(null);

  const booked = session._count?.bookings ?? 0;
  const seatsLeft = session.maxParticipants - booked;
  const isFull = seatsLeft <= 0;

  async function handleBook() {
    setState('booking');
    setError(null);
    // Optimistic capacity bump — reverted below if the request fails.
    onBookingChange?.(1);
    try {
      const { data } = await bookingsApi.create(session.id);
      setBookingId(data.id);
      setState(data.status === 'WAITLISTED' ? 'waitlisted' : 'booked');
    } catch (err) {
      onBookingChange?.(-1);
      setState('error');
      setError(err instanceof ApiClientError ? err.message : 'Could not book this session.');
    }
  }

  async function handleCancel() {
    if (!bookingId) return;
    setState('booking');
    onBookingChange?.(-1);
    try {
      await bookingsApi.cancel(bookingId);
      setState('idle');
      setBookingId(undefined);
    } catch (err) {
      onBookingChange?.(1);
      setState('error');
      setError(err instanceof ApiClientError ? err.message : 'Could not cancel this booking.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/30" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-sm flex-col bg-white p-6 shadow-2xl sm:rounded-l-2xl"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {sessionCategoryLabels[session.category as keyof typeof sessionCategoryLabels] ?? session.category}
            </p>
            <h2 className="font-display text-lg font-semibold text-ink-950">{session.name}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-ink-950" aria-label="Close">✕</button>
        </div>

        <dl className="mb-6 space-y-2 text-sm">
          <Row label="Date & time" value={new Date(session.scheduledDate).toLocaleString()} />
          <Row label="Duration" value={`${session.durationMin} min`} />
          <Row label="Location" value={session.mode === 'ONLINE' ? 'Online' : (session.location ?? '—')} />
          {session.estimatedCalories && <Row label="Est. calories" value={`~${session.estimatedCalories} kcal`} />}
          <Row
            label="Capacity"
            value={isFull ? 'Full — waitlist available' : `${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left`}
          />
        </dl>

        {error && <div className="mb-4 rounded-lg bg-warning-bg px-3 py-2 text-xs text-ink-950">{error}</div>}

        {state === 'booked' && (
          <div className="mb-4 rounded-lg bg-positive-bg px-3 py-2 text-xs font-semibold text-positive">
            You're booked in.
          </div>
        )}
        {state === 'waitlisted' && (
          <div className="mb-4 rounded-lg bg-warning-bg px-3 py-2 text-xs font-semibold text-warning">
            Session is full — you've been added to the waitlist.
          </div>
        )}

        <div className="mt-auto flex gap-3">
          {(state === 'idle' || state === 'error') && (
            <button
              onClick={handleBook}
              className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-ink disabled:opacity-60"
              disabled={session.status !== 'SCHEDULED'}
            >
              {isFull ? 'Join Waitlist' : 'Book Session'}
            </button>
          )}
          {(state === 'booked' || state === 'waitlisted') && (
            <button onClick={handleCancel} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-ink-950">
              Cancel Booking
            </button>
          )}
          {state === 'booking' && (
            <button disabled className="flex-1 rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-400">
              Working…
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-ink-950">{value}</dd>
    </div>
  );
}
