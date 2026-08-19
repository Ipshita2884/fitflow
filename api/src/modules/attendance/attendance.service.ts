import { prisma } from '../../lib/prisma';
import { ForbiddenError, NotFoundError } from '../../lib/errors';
import { emitToRoom } from '../../realtime/emitter';
import { MarkAttendanceInput } from './attendance.validators';

export async function markAttendance(trainerProfileId: string, input: MarkAttendanceInput) {
  const session = await prisma.session.findUnique({
    where: { id: input.sessionId },
    select: { id: true, trainerId: true },
  });
  if (!session) throw new NotFoundError('Session');
  if (session.trainerId !== trainerProfileId) throw new ForbiddenError();

  const results = await prisma.$transaction(
    input.records.map((r) =>
      prisma.attendance.upsert({
        where: { sessionId_clientId: { sessionId: input.sessionId, clientId: r.clientId } },
        create: { sessionId: input.sessionId, clientId: r.clientId, status: r.status },
        update: { status: r.status, markedAt: new Date() },
      }),
    ),
  );

  // Also flip the booking to ATTENDED/NO_SHOW so booking history and
  // attendance history stay consistent with each other.
  await prisma.$transaction(
    input.records.map((r) =>
      prisma.sessionBooking.updateMany({
        where: { sessionId: input.sessionId, clientId: r.clientId, status: 'BOOKED' },
        data: { status: r.status === 'PRESENT' || r.status === 'LATE' ? 'ATTENDED' : 'NO_SHOW' },
      }),
    ),
  );

  for (const r of input.records) {
    emitToRoom(`user:${r.clientId}`, 'notification:new', {
      type: 'ATTENDANCE_ALERT',
      title: 'Attendance recorded',
      body: `You were marked ${r.status.toLowerCase()} for today's session.`,
    });
  }

  return results;
}

function bucketRange(range: 'daily' | 'weekly' | 'monthly' | 'yearly'): Date {
  const now = new Date();
  switch (range) {
    case 'daily': return new Date(now.setDate(now.getDate() - 1));
    case 'weekly': return new Date(now.setDate(now.getDate() - 7));
    case 'monthly': return new Date(now.setMonth(now.getMonth() - 1));
    case 'yearly': return new Date(now.setFullYear(now.getFullYear() - 1));
  }
}

export async function getAttendanceSummary(
  clientId: string,
  range: 'daily' | 'weekly' | 'monthly' | 'yearly',
  from?: Date,
  to?: Date,
) {
  const gte = from ?? bucketRange(range);
  const lte = to ?? new Date();

  const records = await prisma.attendance.findMany({
    where: { clientId, markedAt: { gte, lte } },
    orderBy: { markedAt: 'asc' },
  });

  const total = records.length;
  const present = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : null;

  return {
    range,
    from: gte,
    to: lte,
    totalSessions: total,
    attended: present,
    attendancePercentage,
    records,
  };
}

/**
 * Flags clients with no PRESENT/LATE attendance in the last `days` days
 * who have at least one scheduled session in that window (so a client who
 * simply has no sessions scheduled isn't wrongly flagged as declining).
 * Intended to be called from a scheduled BullMQ job, not per-request.
 */
export async function findClientsWithDecliningAttendance(trainerProfileId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const clients = await prisma.clientProfile.findMany({
    where: { trainerId: trainerProfileId, status: 'ACTIVE' },
    select: {
      id: true,
      fullName: true,
      attendanceRecords: { where: { markedAt: { gte: since } }, select: { status: true } },
      bookings: { where: { status: 'BOOKED', session: { scheduledDate: { gte: since } } }, select: { id: true } },
    },
  });

  return clients
    .filter((c) => c.bookings.length > 0)
    .filter((c) => !c.attendanceRecords.some((a) => a.status === 'PRESENT' || a.status === 'LATE'))
    .map((c) => ({ clientId: c.id, fullName: c.fullName, daysSinceLastAttendance: days }));
}
