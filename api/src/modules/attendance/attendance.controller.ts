import { Request, Response } from 'express';
import { asyncHandler } from '../../lib/errors';
import { ForbiddenError } from '../../lib/errors';
import { markAttendanceSchema, attendanceSummaryQuerySchema } from './attendance.validators';
import * as attendanceService from './attendance.service';
import { prisma } from '../../lib/prisma';

export const markAttendance = asyncHandler(async (req: Request, res: Response) => {
  const input = markAttendanceSchema.parse(req.body);
  const trainerProfile = await prisma.trainerProfile.findUniqueOrThrow({
    where: { userId: req.auth!.userId },
    select: { id: true },
  });
  const result = await attendanceService.markAttendance(trainerProfile.id, input);
  res.status(200).json({ data: result });
});

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const query = attendanceSummaryQuerySchema.parse(req.query);

  // A client can only ever request their own summary; a trainer can request
  // any of their own clients' summaries (checked below).
  if (req.auth!.role === 'CLIENT') {
    const clientProfile = await prisma.clientProfile.findUniqueOrThrow({
      where: { userId: req.auth!.userId },
      select: { id: true },
    });
    if (clientProfile.id !== query.clientId) throw new ForbiddenError();
  } else {
    const client = await prisma.clientProfile.findUnique({
      where: { id: query.clientId },
      select: { trainer: { select: { userId: true } } },
    });
    if (!client || client.trainer.userId !== req.auth!.userId) throw new ForbiddenError();
  }

  const summary = await attendanceService.getAttendanceSummary(
    query.clientId, query.range, query.from, query.to,
  );
  res.json({ data: summary });
});
