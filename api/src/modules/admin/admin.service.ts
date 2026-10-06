import { prisma } from '../../lib/prisma';

export class AdminService {
  static async getDashboardStats() {
    const [totalUsers, totalTrainers, totalClients, activeSessions, totalBookings, pendingVerifications] = await Promise.all([
      prisma.user.count(),
      prisma.trainerProfile.count(),
      prisma.clientProfile.count(),
      prisma.session.count({ where: { status: 'SCHEDULED' } }),
      prisma.sessionBooking.count(),
      prisma.certification.count({ where: { status: 'PENDING_VERIFICATION' } }),
    ]);

    return {
      totalUsers,
      totalTrainers,
      totalClients,
      activeSessions,
      totalBookings,
      pendingVerifications,
    };
  }

  static async listUsers(page = 1, limit = 20, search?: string, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (role) where.role = role;
    if (search) {
      where.email = { contains: search, mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isEmailVerified: true,
          isOnline: true,
          lastSeenAt: true,
          createdAt: true,
          trainerProfile: { select: { fullName: true, slug: true } },
          clientProfile: { select: { fullName: true, status: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async listVerificationQueue() {
    return prisma.certification.findMany({
      where: { status: 'PENDING_VERIFICATION' },
      include: {
        trainer: {
          select: {
            id: true,
            fullName: true,
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async verifyCertification(adminUserId: string, certificationId: string, approve: boolean) {
    const status = approve ? 'VERIFIED' : 'REJECTED';
    return prisma.certification.update({
      where: { id: certificationId },
      data: {
        status,
        verifiedByAdminId: adminUserId,
        verifiedAt: new Date(),
      },
    });
  }
}
