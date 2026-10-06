import { z } from 'zod';

export const createClientSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6).optional(),
    fullName: z.string().min(2),
    phone: z.string().optional(),
    age: z.number().min(1).max(120).optional(),
    heightCm: z.number().min(50).max(300).optional(),
    currentWeightKg: z.number().min(20).max(500).optional(),
    targetWeightKg: z.number().min(20).max(500).optional(),
    fitnessLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    primaryGoal: z.string().optional(),
    initialNotes: z.string().optional(),
  })
});

export const associateClientSchema = z.object({
  body: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    clientId: z.string().optional(),
  }).refine(data => data.email || data.phone || data.clientId, {
    message: 'Either email, phone, or clientId must be provided'
  })
});

export const findClientSchema = z.object({
  query: z.object({
    identifier: z.string().min(2),
  })
});

export const updateClientSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    status: z.enum(['ACTIVE', 'PAUSED', 'INACTIVE']).optional(),
    targetWeightKg: z.number().optional(),
  })
});

export const listClientsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    pageSize: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    status: z.enum(['ALL', 'ACTIVE', 'PAUSED', 'INACTIVE', 'ARCHIVED']).optional(),
    sortBy: z.enum(['name', 'fullName', 'createdAt', 'joiningDate', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  })
});

export const createAssessmentSchema = z.object({
  body: z.object({
    endurance: z.number().min(1).max(10).optional(),
    strength: z.number().min(1).max(10).optional(),
    flexibility: z.number().min(1).max(10).optional(),
    mobility: z.number().min(1).max(10).optional(),
    notes: z.string().optional(),
    isBaseline: z.boolean().optional(),
  })
});

export const createMeasurementSchema = z.object({
  body: z.object({
    weightKg: z.number().optional(),
    waistCm: z.number().optional(),
    chestCm: z.number().optional(),
    hipCm: z.number().optional(),
    armsCm: z.number().optional(),
    thighsCm: z.number().optional(),
    bodyFatPercent: z.number().optional(),
  })
});

