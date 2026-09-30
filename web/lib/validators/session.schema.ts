import { z } from 'zod';

// NOTE: in the monorepo this lives in packages/shared-types and is imported
// by both apps/web and apps/api, so frontend forms and backend validation
// can never drift apart. Duplicated here only for standalone delivery.

export const sessionCategories = [
  'ZUMBA_BEGINNER', 'ZUMBA_FAT_BURN', 'ZUMBA_TONING', 'DANCE_CARDIO',
  'HIIT_ZUMBA', 'LOW_IMPACT_ZUMBA', 'STRENGTH_ZUMBA', 'MOBILITY_ZUMBA', 'CUSTOM',
] as const;

export const sessionCategoryLabels: Record<(typeof sessionCategories)[number], string> = {
  ZUMBA_BEGINNER: 'Zumba Beginner',
  ZUMBA_FAT_BURN: 'Zumba Fat Burn',
  ZUMBA_TONING: 'Zumba Toning',
  DANCE_CARDIO: 'Dance Cardio',
  HIIT_ZUMBA: 'HIIT Zumba',
  LOW_IMPACT_ZUMBA: 'Low Impact Zumba',
  STRENGTH_ZUMBA: 'Strength + Zumba',
  MOBILITY_ZUMBA: 'Mobility + Zumba',
  CUSTOM: 'Custom',
};

export const exercisePhases = ['WARM_UP', 'MAIN', 'STRENGTH_CARDIO', 'COOLDOWN'] as const;

export const phaseLabels: Record<(typeof exercisePhases)[number], string> = {
  WARM_UP: 'Warm-Up',
  MAIN: 'Main Session',
  STRENGTH_CARDIO: 'Strength / Cardio',
  COOLDOWN: 'Cooldown',
};

export const sessionExerciseSchema = z.object({
  id: z.string(), // client-side temp id for list rendering, stripped before submit
  phase: z.enum(exercisePhases),
  name: z.string().min(1, 'Move name is required').max(120),
  durationSec: z.coerce.number().int().positive().optional(),
  order: z.number().int().nonnegative(),
  notes: z.string().max(500).optional(),
});

export const sessionFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(120),
  description: z.string().max(1000).optional(),
  category: z.enum(sessionCategories),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']),
  durationMin: z.coerce.number().int().min(10, 'Minimum 10 minutes').max(180),
  maxParticipants: z.coerce.number().int().min(1).max(200),
  scheduledDate: z.string().min(1, 'Date & time is required'),
  mode: z.enum(['IN_PERSON', 'ONLINE']),
  location: z.string().max(200).optional(),
  estimatedCalories: z.coerce.number().int().positive().optional(),
  exercises: z.array(sessionExerciseSchema).min(1, 'Add at least one move'),
}).refine(
  (data) => data.mode === 'ONLINE' || (data.location && data.location.length > 0),
  { message: 'Location is required for in-person sessions', path: ['location'] },
);

export type SessionFormValues = z.infer<typeof sessionFormSchema>;
export type SessionExerciseValues = z.infer<typeof sessionExerciseSchema>;
