import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { Role } from '@prisma/client';

export class AuthService {
  static async register(data: any) {
    const normalizedEmail = data.email.trim().toLowerCase();

    if (data.role === Role.ADMIN) {
      throw { status: 403, message: 'Public registration for ADMIN role is strictly forbidden' };
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw { status: 409, message: 'This email is already registered' };

    const passwordHash = await bcrypt.hash(data.password, 10);
    const emailVerifyToken = jwt.sign({ email: normalizedEmail, purpose: 'verify' }, env.JWT_SECRET, { expiresIn: '1d' });

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          role: data.role,
          emailVerifyToken,
        }
      });

      if (data.role === Role.TRAINER) {
        const slug = data.fullName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
        await tx.trainerProfile.create({
          data: {
            userId: user.id,
            fullName: data.fullName,
            slug,
          }
        });
      } else if (data.role === Role.CLIENT) {
        // Find default or first available trainer for newly registered clients
        const defaultTrainer = await tx.trainerProfile.findFirst();
        if (!defaultTrainer) {
          throw { status: 500, message: 'No available trainer found in system to assign client profile' };
        }

        await tx.clientProfile.create({
          data: {
            userId: user.id,
            fullName: data.fullName,
            trainerId: defaultTrainer.id,
          }
        });
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        emailVerifyToken: user.emailVerifyToken,
      };
    });
  }


  static async login(data: any) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw { status: 401, message: 'Invalid credentials' };

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw { status: 401, message: 'Invalid credentials' };

    const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: '7d' });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash, isOnline: true, lastSeenAt: new Date() }
    });
    
    return { user: { id: user.id, email: user.email, role: user.role }, token, refreshToken };
  }

  static async refresh(refreshToken: string) {
    try {
      const decoded: any = jwt.verify(refreshToken, env.JWT_SECRET);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user || !user.refreshTokenHash) {
        throw { status: 401, message: 'Invalid refresh token' };
      }

      const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
      if (!valid) throw { status: 401, message: 'Invalid refresh token' };

      const newToken = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '1d' });
      return { token: newToken, user: { id: user.id, email: user.email, role: user.role } };
    } catch (err) {
      throw { status: 401, message: 'Invalid or expired refresh token' };
    }
  }

  static async forgotPassword(rawEmail: string) {
    const normalizedEmail = rawEmail.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    
    // Always return account-enumeration safe response regardless of existence
    const safeResponse = { message: 'If an account exists for this email, a password reset link has been sent.' };
    
    if (!user) {
      return safeResponse;
    }

    // Generate cryptographically secure random 32-byte token
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiration

    // Persist reset token and invalidate previous active token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiresAt: expiresAt,
      },
    });

    // Cleanly abstracted EmailService trigger
    console.log(`[EmailService] Password reset link for ${normalizedEmail}: ${env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);

    return safeResponse;
  }


  static async resetPassword(token: string, password: string) {
    if (!token || typeof token !== 'string') {
      throw { status: 400, message: 'Invalid or missing reset token' };
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiresAt: { gt: new Date() }
      }
    });

    if (!user) {
      throw { status: 400, message: 'This password reset link is invalid, expired, or has already been used.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Transactional atomic execution to update password, invalidate reset token, and revoke active sessions
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetToken: null,
          passwordResetExpiresAt: null,
          refreshTokenHash: null, // Revokes existing refresh sessions
        }
      });
    });

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  }


  static async verifyEmail(token: string) {
    if (!token || typeof token !== 'string') {
      throw { status: 400, message: 'Invalid or missing verification token' };
    }

    const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
    
    if (!user) {
      throw { status: 400, message: 'This email verification link is invalid, expired, or has already been used.' };
    }

    if (user.isEmailVerified) {
      return { message: 'Your email address has already been verified.' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerifyToken: null, // Single-use token invalidation
        }
      });
    });

    return { message: 'Email verified successfully! You can now log in to your account.' };
  }

  static async resendVerification(rawEmail: string) {
    const normalizedEmail = rawEmail.trim().toLowerCase();
    const safeResponse = { message: 'If an account requiring verification exists for this email, a new verification link has been sent.' };

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || user.isEmailVerified) {
      return safeResponse;
    }

    const crypto = await import('crypto');
    const newVerifyToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: newVerifyToken }
    });

    console.log(`[EmailService] Resent email verification link for ${normalizedEmail}: ${env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${newVerifyToken}`);

    return safeResponse;
  }


  static async getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        isOnline: true,
        lastSeenAt: true,
        createdAt: true,
        trainerProfile: true,
        clientProfile: true,
      }
    });
  }
}

