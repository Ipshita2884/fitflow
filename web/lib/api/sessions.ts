import { SessionFormValues } from '../validators/session.schema';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

class ApiClientError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiClientError(res.status, body.message ?? 'Request failed', body.details);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface SessionDTO {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  durationMin: number;
  maxParticipants: number;
  scheduledDate: string;
  mode: 'IN_PERSON' | 'ONLINE';
  location?: string;
  estimatedCalories?: number;
  status: string;
  _count?: { bookings: number };
}

export const sessionsApi = {
  list: (params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ items: SessionDTO[]; total?: number }>(`/sessions${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<{ data: SessionDTO }>(`/sessions/${id}`),
  create: (payload: Omit<SessionFormValues, 'exercises'> & { exercises: Omit<SessionFormValues['exercises'][number], 'id'>[] }) =>
    request<{ data: SessionDTO }>('/sessions', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<SessionFormValues>) =>
    request<{ data: SessionDTO }>(`/sessions/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  cancel: (id: string) => request<void>(`/sessions/${id}`, { method: 'DELETE' }),
};

export const bookingsApi = {
  create: (sessionId: string) =>
    request<{ data: { id: string; status: 'BOOKED' | 'WAITLISTED' } }>('/bookings', {
      method: 'POST', body: JSON.stringify({ sessionId }),
    }),
  cancel: (bookingId: string) => request<void>(`/bookings/${bookingId}/cancel`, { method: 'PATCH' }),
  listMine: () => request<{ data: unknown[] }>('/bookings/me'),
  listForSession: (sessionId: string) =>
    request<{ data: { id: string; clientId: string; status: string; client: { id: string; fullName: string; profilePictureUrl?: string } }[] }>(
      `/bookings/session/${sessionId}`,
    ),
};

export const attendanceApi = {
  mark: (sessionId: string, records: { clientId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'CANCELLED' }[]) =>
    request('/attendance', { method: 'POST', body: JSON.stringify({ sessionId, records }) }),
  summary: (clientId: string, range: 'daily' | 'weekly' | 'monthly' | 'yearly') =>
    request(`/attendance/summary?${new URLSearchParams({ clientId, range })}`),
};

export { ApiClientError };
