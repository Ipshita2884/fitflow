import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ConflictError, ForbiddenError, NotFoundError } from '../../lib/errors';
import { emitToRoom } from '../../realtime/emitter';

/**
 * Books a client into a session, or waitlists them if full.
 *
 * Capacity checks race against concurrent bookings for the same session
 * (two clients tapping "Book" on the last seat at the same moment), so the
 * count-then-insert happens inside a SERIALIZABLE transaction. Postgres will
 * abort one of the two transactions with a serialization failure rather than
 * let both succeed — the caller (controller) retries once on that specific
 * error code, which is standard practice for this isolation level.
 */
export async function createBooking(clientProfileId: string, sessionId: string) {
  return prisma.$transaction(
    async (tx) => {
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        select: { id: true, trainerId: true, status: true, maxParticipants: true },
      });
      if (!session) throw new NotFoundError('Session');
      if (session.status !== 'SCHEDULED') {
        throw new ConflictError('This session is no longer accepting bookings');
      }

      // Ensure the client belongs to this session's trainer (never allow
      // cross-trainer booking even if the client guesses a sessionId).
      const client = await tx.clientProfile.findUnique({
        where: { id: clientProfileId },
        select: { trainerId: true },
      });
      if (!client || client.trainerId !== session.trainerId) throw new ForbiddenError();

      const existing = await tx.sessionBooking.findUnique({
        where: { sessionId_clientId: { sessionId, clientId: clientProfileId } },
      });
      if (existing && existing.status === 'BOOKED') {
        throw new ConflictError('You already have a booking for this session');
      }

      const bookedCount = await tx.sessionBooking.count({
        where: { sessionId, status: 'BOOKED' },
      });
      const status = bookedCount < session.maxParticipants ? 'BOOKED' : 'WAITLISTED';

      const booking = existing
        ? await tx.sessionBooking.update({
            where: { id: existing.id },
            data: { status, cancelledAt: null, bookedAt: new Date() },
          })
        : await tx.sessionBooking.create({
            data: { sessionId, clientId: clientProfileId, status },
          });

      const newCount = status === 'BOOKED' ? bookedCount + 1 : bookedCount;

      emitToRoom(`trainer:${session.trainerId}`, 'session:booking_updated', {
        sessionId, seatsBooked: newCount, seatsTotal: session.maxParticipants,
      });
      emitToRoom(`session:${sessionId}`, 'session:booking_updated', {
        sessionId, seatsBooked: newCount, seatsTotal: session.maxParticipants,
      });

      return booking;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function cancelBooking(actor: { role: 'CLIENT' | 'TRAINER'; clientProfileId?: string; trainerProfileId?: string }, bookingId: string) {
  const booking = await prisma.sessionBooking.findUnique({
    where: { id: bookingId },
    include: { session: { select: { id: true, trainerId: true, maxParticipants: true } } },
  });
  if (!booking) throw new NotFoundError('Booking');

  const isOwner = actor.role === 'CLIENT' && booking.clientId === actor.clientProfileId;
  const isTrainerOwner = actor.role === 'TRAINER' && booking.session.trainerId === actor.trainerProfileId;
  if (!isOwner && !isTrainerOwner) throw new ForbiddenError();

  const updated = await prisma.$transaction(async (tx) => {
    const cancelled = await tx.sessionBooking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });

    // Promote the earliest waitlisted booking into the freed seat, if any.
    if (booking.status === 'BOOKED') {
      const nextWaiting = await tx.sessionBooking.findFirst({
        where: { sessionId: booking.sessionId, status: 'WAITLISTED' },
        orderBy: { bookedAt: 'asc' },
      });
      if (nextWaiting) {
        await tx.sessionBooking.update({
          where: { id: nextWaiting.id },
          data: { status: 'BOOKED' },
        });
        emitToRoom(`user:${nextWaiting.clientId}`, 'notification:new', {
          type: 'BOOKING',
          title: 'You\u2019re off the waitlist',
          body: 'A seat opened up and you\u2019ve been booked in.',
        });
      }
    }

    return cancelled;
  });

  const bookedCount = await prisma.sessionBooking.count({
    where: { sessionId: booking.sessionId, status: 'BOOKED' },
  });
  emitToRoom(`trainer:${booking.session.trainerId}`, 'session:booking_updated', {
    sessionId: booking.sessionId, seatsBooked: bookedCount, seatsTotal: booking.session.maxParticipants,
  });

  return updated;
}

export async function listBookingsForSession(sessionId: string) {
  return prisma.sessionBooking.findMany({
    where: { sessionId },
    include: { client: { select: { id: true, fullName: true, profilePictureUrl: true } } },
    orderBy: { bookedAt: 'asc' },
  });
}

export async function listBookingsForClient(clientProfileId: string) {
  return prisma.sessionBooking.findMany({
    where: { clientId: clientProfileId, status: { in: ['BOOKED', 'WAITLISTED'] } },
    include: { session: true },
    orderBy: { session: { scheduledDate: 'asc' } },
  });
}
