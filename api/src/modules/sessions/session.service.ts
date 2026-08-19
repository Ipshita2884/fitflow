import { prisma } from '../../lib/prisma';
import { ForbiddenError, NotFoundError } from '../../lib/errors';
import { emitToRoom } from '../../realtime/emitter';
import { CreateSessionInput, ListSessionsQuery, UpdateSessionInput } from './session.validators';

export async function createSession(trainerProfileId: string, input: CreateSessionInput) {
  const session = await prisma.session.create({
    data: {
      trainerId: trainerProfileId,
      name: input.name,
      description: input.description,
      category: input.category,
      difficulty: input.difficulty,
      durationMin: input.durationMin,
      maxParticipants: input.maxParticipants,
      scheduledDate: input.scheduledDate,
      mode: input.mode,
      location: input.location,
      estimatedCalories: input.estimatedCalories,
      exercises: {
        create: input.exercises.map((e) => ({
          phase: e.phase,
          name: e.name,
          durationSec: e.durationSec,
          order: e.order,
          notes: e.notes,
        })),
      },
    },
    include: { exercises: { orderBy: [{ phase: 'asc' }, { order: 'asc' }] } },
  });

  // Notify clients who follow this trainer that a new bookable session exists.
  emitToRoom(`trainer:${trainerProfileId}`, 'session:created', { session });

  return session;
}

export async function updateSession(
  trainerProfileId: string,
  sessionId: string,
  input: UpdateSessionInput,
) {
  const existing = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!existing) throw new NotFoundError('Session');
  if (existing.trainerId !== trainerProfileId) throw new ForbiddenError();

  const session = await prisma.$transaction(async (tx) => {
    if (input.exercises) {
      await tx.sessionExercise.deleteMany({ where: { sessionId } });
    }
    return tx.session.update({
      where: { id: sessionId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.category && { category: input.category }),
        ...(input.difficulty && { difficulty: input.difficulty }),
        ...(input.durationMin && { durationMin: input.durationMin }),
        ...(input.maxParticipants && { maxParticipants: input.maxParticipants }),
        ...(input.scheduledDate && { scheduledDate: input.scheduledDate }),
        ...(input.mode && { mode: input.mode }),
        ...(input.location !== undefined && { location: input.location }),
        ...(input.estimatedCalories !== undefined && { estimatedCalories: input.estimatedCalories }),
        ...(input.exercises && {
          exercises: {
            create: input.exercises.map((e) => ({
              phase: e.phase, name: e.name, durationSec: e.durationSec,
              order: e.order, notes: e.notes,
            })),
          },
        }),
      },
      include: { exercises: { orderBy: [{ phase: 'asc' }, { order: 'asc' }] } },
    });
  });

  emitToRoom(`trainer:${trainerProfileId}`, 'session:updated', { session });
  return session;
}

export async function cancelSession(trainerProfileId: string, sessionId: string) {
  const existing = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!existing) throw new NotFoundError('Session');
  if (existing.trainerId !== trainerProfileId) throw new ForbiddenError();

  const session = await prisma.session.update({
    where: { id: sessionId },
    data: { status: 'CANCELLED' },
  });

  // Also flip any active bookings so clients' "My Sessions" lists reflect reality.
  await prisma.sessionBooking.updateMany({
    where: { sessionId, status: 'BOOKED' },
    data: { status: 'CANCELLED', cancelledAt: new Date() },
  });

  emitToRoom(`trainer:${trainerProfileId}`, 'session:cancelled', { sessionId });
  emitToRoom(`session:${sessionId}`, 'session:cancelled', { sessionId });
  return session;
}

export async function getSessionById(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      exercises: { orderBy: [{ phase: 'asc' }, { order: 'asc' }] },
      bookings: { where: { status: 'BOOKED' }, select: { id: true, clientId: true } },
    },
  });
  if (!session) throw new NotFoundError('Session');
  return session;
}

export async function listSessionsForTrainer(trainerProfileId: string, query: ListSessionsQuery) {
  const where = {
    trainerId: trainerProfileId,
    ...(query.from || query.to
      ? { scheduledDate: { ...(query.from && { gte: query.from }), ...(query.to && { lte: query.to }) } }
      : {}),
    ...(query.category && { category: query.category as never }),
    ...(query.status && { status: query.status }),
  };

  const [items, total] = await prisma.$transaction([
    prisma.session.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      include: { _count: { select: { bookings: { where: { status: 'BOOKED' } } } } },
    }),
    prisma.session.count({ where }),
  ]);

  return { items, total, page: query.page, limit: query.limit };
}

/** Bookable sessions for a client — scoped to their own trainer only. */
export async function listSessionsForClient(clientTrainerId: string, query: ListSessionsQuery) {
  const where = {
    trainerId: clientTrainerId,
    status: 'SCHEDULED' as const,
    ...(query.from || query.to
      ? { scheduledDate: { ...(query.from && { gte: query.from }), ...(query.to && { lte: query.to }) } }
      : {}),
  };

  const items = await prisma.session.findMany({
    where,
    orderBy: { scheduledDate: 'asc' },
    take: query.limit,
    skip: (query.page - 1) * query.limit,
    include: { _count: { select: { bookings: { where: { status: 'BOOKED' } } } } },
  });

  return items;
}
