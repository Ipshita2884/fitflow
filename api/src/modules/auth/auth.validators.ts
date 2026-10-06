import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    role: z.enum(['TRAINER', 'CLIENT'], { errorMap: () => ({ message: 'Public registration is restricted to TRAINER or CLIENT roles' }) }),
    fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
    termsAccepted: z.literal(true, { errorMap: () => ({ message: 'You must accept the Terms of Service and Privacy Policy' }) }),
  })
});


export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(6)
  })
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  })
});

