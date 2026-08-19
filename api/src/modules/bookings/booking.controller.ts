import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { asyncHandler } from '../../lib/errors';
import { createBookingSchema } from './booking.validators';
import * as bookingService from './booking.service';
import { prisma } from '../../lib/prisma';

// Postgres serialization_failure code — see booking.service.ts createBooking() docstring.
const SERIALIZATION_FAILURE = '40001';

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = createBookingSchema.parse(req.body);
  const clientProfile = await prisma.clientProfile.findUniqueOrThrow({
    where: { userId: req.auth!.userId },
    select: { id: true },
  });

  let attempt = 0;
  while (attempt < 2) {
    try {
      const booking = await bookingService.createBooking(clientProfile.id, sessionId);
      return res.status(201).json({ data: booking });
    } catch (err) {
      const isSerializationFailure =
        err instanceof Prisma.PrismaClientKnownRequestError && err.meta?.code === SERIALIZATION_FAILURE;
      if (isSerializationFailure && attempt === 0) {
        attempt += 1;
        continue;
      }
      throw err;
    }
  }
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  if (req.auth!.role === 'CLIENT') {
    const clientProfile = await prisma.clientProfile.findUniqueOrThrow({
      where: { userId: req.auth!.userId },
      select: { id: true },
    });
    await bookingService.cancelBooking({ role: 'CLIENT', clientProfileId: clientProfile.id }, req.params.id);
  } else {
    const trainerProfile = await prisma.trainerProfile.findUniqueOrThrow({
      where: { userId: req.auth!.userId },
      select: { id: true },
    });
    await bookingService.cancelBooking({ role: 'TRAINER', trainerProfileId: trainerProfile.id }, req.params.id);
  }
  res.status(204).send();
});

export const listSessionBookings = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await bookingService.listBookingsForSession(req.params.sessionId);
  res.json({ data: bookings });
});

export const listMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const clientProfile = await prisma.clientProfile.findUniqueOrThrow({
    where: { userId: req.auth!.userId },
    select: { id: true },
  });
  const bookings = await bookingService.listBookingsForClient(clientProfile.id);
  res.json({ data: bookings });
});
