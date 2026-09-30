import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { Role } from '@prisma/client';

export class AuthService {
  static async register(data: any) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw { status: 400, message: 'Email already in use' };

    const passwordHash = await bcrypt.hash(data.password, 10);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          role: data.role,
        }
      });

      if (data.role === Role.TRAINER) {
        await tx.trainerProfile.create({
          data: {
            userId: user.id,
            fullName: data.fullName,
            slug: data.fullName.toLowerCase().replace(/ /g, '-'),
          }
        });
      } else if (data.role === Role.CLIENT) {
        // Needs a trainerId, for now we will skip or require it in the schema if needed.
        // Usually, clients are created by trainers. If self-registering, we handle it later.
      }

      return user;
    });
  }

  static async login(data: any) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw { status: 401, message: 'Invalid credentials' };

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw { status: 401, message: 'Invalid credentials' };

    const token = jwt.sign({ userId: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: '1d' });
    
    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }

  static async getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        trainerProfile: true,
        clientProfile: true,
      }
    });
  }
}
