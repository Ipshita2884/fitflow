import { prisma } from '../../lib/prisma';
import { ForbiddenError, NotFoundError } from '../../lib/errors';

export class TrainerDashboardService {
  static async getDashboardData(userId: string) {
    const trainer = await prisma.trainerProfile.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new NotFoundError('TrainerProfile');
    }

    const trainerId = trainer.id;

    // Time boundaries for today's sessions & trends
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const thirtyDaysAgo = new Date(now.valueOf() - 30 * 24 * 60 * 60 * 1000);

    // Parallel database aggregation queries
    const [
      activeClientsCount,
      todaySessions,
      upcomingBookings,
      attendanceRecords,
      goalsStats,
      unreadMessagesCount,
      notifications,
      recentActivity,
    ] = await Promise.all([
      // 1. Active Clients
      prisma.clientProfile.count({
        where: { trainerId, status: 'ACTIVE' },
      }),

      // 2. Today's Sessions
      prisma.session.findMany({
        where: {
          trainerId,
          scheduledDate: { gte: startOfToday, lte: endOfToday },
        },
        orderBy: { scheduledDate: 'asc' },
        include: {
          _count: { select: { bookings: { where: { status: 'BOOKED' } } } },
        },
      }),

      // 3. Upcoming Bookings
      prisma.sessionBooking.findMany({
        where: {
          session: { trainerId, scheduledDate: { gte: now } },
          status: 'BOOKED',
        },
        take: 5,
        orderBy: { session: { scheduledDate: 'asc' } },
        include: {
          client: { select: { id: true, fullName: true, profilePictureUrl: true } },
          session: { select: { id: true, name: true, scheduledDate: true, category: true } },
        },
      }),

      // 4. Attendance Stats for last 30 days
      prisma.attendance.findMany({
        where: {
          session: { trainerId },
          markedAt: { gte: thirtyDaysAgo },
        },
        select: { status: true },
      }),

      // 5. Active and Completed Goals
      prisma.fitnessGoal.groupBy({
        by: ['status'],
        where: { client: { trainerId } },
        _count: { _all: true },
      }),

      // 6. Unread Messages Count
      prisma.message.count({
        where: {
          conversation: { participants: { some: { userId } } },
          senderId: { not: userId },
          readReceipts: { none: { userId } },
        },
      }),

      // 7. Recent Notifications
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // 8. Recent Client Activity (Logs & Assessments)
      prisma.progressLog.findMany({
        where: { client: { trainerId } },
        orderBy: { date: 'desc' },
        take: 5,
        include: { client: { select: { id: true, fullName: true } } },
      }),
    ]);

    // Aggregate Attendance Rate
    const totalAttendanceCount = attendanceRecords.length;
    const attendedCount = attendanceRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const attendanceRate = totalAttendanceCount > 0 ? Math.round((attendedCount / totalAttendanceCount) * 100) : 100;

    // Aggregate Goals Summary
    const activeGoalsCount = goalsStats.find((g) => g.status === 'ACTIVE')?._count._all || 0;
    const completedGoalsCount = goalsStats.find((g) => g.status === 'COMPLETED')?._count._all || 0;

    return {
      trainer: {
        id: trainer.id,
        fullName: trainer.fullName,
        slug: trainer.slug,
        profilePictureUrl: trainer.profilePictureUrl,
        rating: trainer.rating,
      },
      kpis: {
        activeClients: activeClientsCount,
        todaySessions: todaySessions.length,
        upcomingBookingsCount: upcomingBookings.length,
        attendanceRate,
        unreadMessages: unreadMessagesCount,
      },
      todaySessions,
      upcomingBookings,
      attendance: {
        total: totalAttendanceCount,
        attended: attendedCount,
        rate: attendanceRate,
      },
      goals: {
        active: activeGoalsCount,
        completed: completedGoalsCount,
      },
      notifications,
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        type: 'LOG_UPDATED',
        summary: `${log.client.fullName} logged daily progress (${log.weightKg ? log.weightKg + ' kg' : 'activity'})`,
        timestamp: log.createdAt,
      })),
    };
  }
}
