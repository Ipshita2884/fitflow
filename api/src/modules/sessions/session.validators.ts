import { z } from 'zod';

export const sessionExerciseSchema = z.object({
  phase: z.enum(['WARM_UP', 'MAIN', 'STRENGTH_CARDIO', 'COOLDOWN']),
  name: z.string().min(1).max(120),
  durationSec: z.number().int().positive().optional(),
  order: z.number().int().nonnegative(),
  notes: z.string().max(500).optional(),
});

export const createSessionSchema = z.object({
  name: z.string().min(3).max(120),
  description: z.string().max(1000).optional(),
  category: z.enum([
    'ZUMBA_BEGINNER', 'ZUMBA_FAT_BURN', 'ZUMBA_TONING', 'DANCE_CARDIO',
    'HIIT_ZUMBA', 'LOW_IMPACT_ZUMBA', 'STRENGTH_ZUMBA', 'MOBILITY_ZUMBA', 'CUSTOM',
  ]),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']),
  durationMin: z.number().int().min(10).max(180),
  maxParticipants: z.number().int().min(1).max(200),
  scheduledDate: z.coerce.date(),
  mode: z.enum(['IN_PERSON', 'ONLINE']),
  location: z.string().max(200).optional(),
  estimatedCalories: z.number().int().positive().optional(),
  // The Session Builder sends the full warm-up → main → cooldown structure.
  // At least one exercise total is required so a "session" can't be created empty.
  exercises: z.array(sessionExerciseSchema).min(1),
}).refine(
  (data) => data.mode === 'ONLINE' || (data.location && data.location.length > 0),
  { message: 'Location is required for in-person sessions', path: ['location'] },
);

export const updateSessionSchema = createSessionSchema.partial();

export const listSessionsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  category: z.string().optional(),
  status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
