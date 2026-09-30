'use client';

import { useEffect, useState } from 'react';
import { bookingsApi, attendanceApi, ApiClientError } from '@/lib/api/sessions';
import { LoadingState, ErrorState, EmptyState } from '@/components/states';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'CANCELLED';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; activeClass: string }[] = [
  { value: 'PRESENT', label: 'Present', activeClass: 'bg-positive text-white' },
  { value: 'LATE', label: 'Late', activeClass: 'bg-warning text-white' },
  { value: 'ABSENT', label: 'Absent', activeClass: 'bg-ink-950 text-white' },
  { value: 'CANCELLED', label: 'Cancelled', activeClass: 'bg-slate-300 text-ink-950' },
];

interface Roster {
  clientId: string;
  fullName: string;
  profilePictureUrl?: string;
}

export function AttendanceMarker({ sessionId, sessionName }: { sessionId: string; sessionName: string }) {
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [roster, setRoster] = useState<Roster[]>([]);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    bookingsApi.listForSession(sessionId)
      .then(({ data }) => {
        if (cancelled) return;
        const booked = data.filter((b) => b.status === 'BOOKED' || b.status === 'ATTENDED' || b.status === 'NO_SHOW');
        setRoster(booked.map((b) => ({ clientId: b.client.id, fullName: b.client.fullName, profilePictureUrl: b.client.profilePictureUrl })));
        setLoadState('ready');
      })
      .catch(() => !cancelled && setLoadState('error'));
    return () => { cancelled = true; };
  }, [sessionId]);

  function setMark(clientId: string, status: AttendanceStatus) {
    setMarks((prev) => ({ ...prev, [clientId]: status }));
  }

  async function handleSave() {
    const records = Object.entries(marks).map(([clientId, status]) => ({ clientId, status }));
    if (records.length === 0) return;
    setSaveState('saving');
    setSaveError(null);
    try {
      await attendanceApi.mark(sessionId, records);
      setSaveState('saved');
    } catch (err) {
      setSaveState('error');
      setSaveError(err instanceof ApiClientError ? err.message : 'Could not save attendance.');
    }
  }

  if (loadState === 'loading') return <LoadingState label="Loading roster…" />;
  if (loadState === 'error') return <ErrorState message="Couldn't load the booking roster." onRetry={() => setLoadState('loading')} />;
  if (roster.length === 0) {
    return <EmptyState title="No one's booked yet" description="Attendance can be marked once clients book into this session." />;
  }

  const markedCount = Object.keys(marks).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-ink-950">Mark Attendance</h3>
          <p className="text-xs text-slate-500">{sessionName} · {roster.length} booked</p>
        </div>
        <span className="text-xs font-medium text-slate-500">{markedCount} / {roster.length} marked</span>
      </div>

      <div className="flex flex-col divide-y divide-slate-100">
        {roster.map((client) => (
          <div key={client.clientId} className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-800 font-display text-xs font-semibold text-white">
                {client.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <span className="text-sm font-medium text-ink-950">{client.fullName}</span>
            </div>
            <div className="flex gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMark(client.clientId, opt.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    marks[client.clientId] === opt.value ? opt.activeClass : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {saveState === 'error' && saveError && (
        <div className="mt-4 rounded-lg bg-warning-bg px-3 py-2 text-xs text-ink-950">{saveError}</div>
      )}
      {saveState === 'saved' && (
        <div className="mt-4 rounded-lg bg-positive-bg px-3 py-2 text-xs font-semibold text-positive">Attendance saved.</div>
      )}

      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSave}
          disabled={markedCount === 0 || saveState === 'saving'}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink disabled:opacity-50"
        >
          {saveState === 'saving' ? 'Saving…' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );
}
