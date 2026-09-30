'use client';

import { sessionCategoryLabels } from '@/lib/validators/session.schema';
import { SessionDTO } from '@/lib/api/sessions';

const categoryLabel = (c: string) =>
  sessionCategoryLabels[c as keyof typeof sessionCategoryLabels] ?? c;

export function SessionCard({ session, onClick }: { session: SessionDTO; onClick?: () => void }) {
  const booked = session._count?.bookings ?? 0;
  const isFull = booked >= session.maxParticipants;
  const date = new Date(session.scheduledDate);

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-ink-950/20 hover:shadow-md"
    >
      <div className="flex w-14 flex-col items-center rounded-lg bg-slate-50 py-2">
        <span className="text-[10px] font-semibold uppercase text-slate-500">
          {date.toLocaleDateString(undefined, { month: 'short' })}
        </span>
        <span className="font-display text-lg font-semibold text-ink-950">{date.getDate()}</span>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink-950">{session.name}</p>
          {session.status === 'CANCELLED' && (
            <span className="rounded-full bg-warning-bg px-2 py-0.5 text-[10px] font-semibold text-warning">Cancelled</span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {categoryLabel(session.category)} · {session.durationMin} min ·{' '}
          {date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} ·{' '}
          {session.mode === 'ONLINE' ? 'Online' : session.location}
        </p>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          isFull ? 'bg-slate-100 text-slate-500' : 'bg-positive-bg text-positive'
        }`}
      >
        {booked} / {session.maxParticipants}
      </span>
    </button>
  );
}
