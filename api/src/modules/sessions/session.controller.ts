import { Request, Response } from 'express';
import { asyncHandler } from '../../lib/errors';
import { createSessionSchema, listSessionsQuerySchema, updateSessionSchema } from './session.validators';
import * as sessionService from './session.service';
import { prisma } from '../../lib/prisma';

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const input = createSessionSchema.parse(req.body);
  const trainerProfile = await prisma.trainerProfile.findUniqueOrThrow({
    where: { userId: req.auth!.userId },
    select: { id: true },
  });
  const session = await sessionService.createSession(trainerProfile.id, input);
  res.status(201).json({ data: session });
});

export const updateSession = asyncHandler(async (req: Request, res: Response) => {
  const input = updateSessionSchema.parse(req.body);
  const trainerProfile = await prisma.trainerProfile.findUniqueOrThrow({
    where: { userId: req.auth!.userId },
    select: { id: true },
  });
  const session = await sessionService.updateSession(trainerProfile.id, req.params.id, input);
  res.json({ data: session });
});

export const cancelSession = asyncHandler(async (req: Request, res: Response) => {
  const trainerProfile = await prisma.trainerProfile.findUniqueOrThrow({
    where: { userId: req.auth!.userId },
    select: { id: true },
  });
  await sessionService.cancelSession(trainerProfile.id, req.params.id);
  res.status(204).send();
});

export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await sessionService.getSessionById(req.params.id);
  res.json({ data: session });
});

export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const query = listSessionsQuerySchema.parse(req.query);

  if (req.auth!.role === 'TRAINER') {
    const trainerProfile = await prisma.trainerProfile.findUniqueOrThrow({
      where: { userId: req.auth!.userId },
      select: { id: true },
    });
    const result = await sessionService.listSessionsForTrainer(trainerProfile.id, query);
    return res.json(result);
  }

  // CLIENT — scoped to their own trainer's bookable sessions only.
  const clientProfile = await prisma.clientProfile.findUniqueOrThrow({
    where: { userId: req.auth!.userId },
    select: { trainerId: true },
  });
  const items = await sessionService.listSessionsForClient(clientProfile.trainerId, query);
  res.json({ items });
});
