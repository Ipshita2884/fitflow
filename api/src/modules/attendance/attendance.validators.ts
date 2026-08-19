import { z } from 'zod';

// Trainer marks attendance for a whole session at once (roster view), not one
// client at a time, so the payload is a bulk array keyed by clientId.
export const markAttendanceSchema = z.object({
  sessionId: z.string().uuid(),
  records: z.array(
    z.object({
      clientId: z.string().uuid(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'CANCELLED']),
    }),
  ).min(1),
});

export const attendanceSummaryQuerySchema = z.object({
  clientId: z.string().uuid(),
  range: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
export type AttendanceSummaryQuery = z.infer<typeof attendanceSummaryQuerySchema>;
