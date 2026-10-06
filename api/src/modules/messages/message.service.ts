import { prisma } from '../../lib/prisma';
import { ForbiddenError, NotFoundError } from '../../lib/errors';
import { emitToRoom } from '../../realtime/emitter';

export class MessageService {
  static async listConversations(userId: string) {
    const participants = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    role: true,
                    isOnline: true,
                    lastSeenAt: true,
                    trainerProfile: { select: { fullName: true, profilePictureUrl: true } },
                    clientProfile: { select: { fullName: true, profilePictureUrl: true } },
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    });

    return participants.map((p) => p.conversation);
  }

  static async getOrCreateConversation(currentUserId: string, targetUserId: string) {
    // Check for existing direct conversation between currentUserId and targetUserId
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: currentUserId } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
    });

    if (existing) return existing;

    return prisma.$transaction(async (tx) => {
      const conv = await tx.conversation.create({});
      await tx.conversationParticipant.createMany({
        data: [
          { conversationId: conv.id, userId: currentUserId },
          { conversationId: conv.id, userId: targetUserId },
        ],
      });
      return conv;
    });
  }

  static async getMessages(userId: string, conversationId: string, page = 1, limit = 50) {
    const isParticipant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (!isParticipant) throw new ForbiddenError('Not a participant in this conversation');

    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          sender: {
            select: { id: true, email: true, role: true },
          },
        },
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    return { messages, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  static async sendMessage(senderId: string, conversationId: string, text: string) {
    const isParticipant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: senderId } },
    });
    if (!isParticipant) throw new ForbiddenError('Not a participant in this conversation');

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderId,
          text,
        },
        include: {
          sender: {
            select: { id: true, email: true, role: true },
          },
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return msg;
    });

    // Real-time broadcast after DB commit
    emitToRoom(`conversation:${conversationId}`, 'message:new', { message });

    return message;
  }
}
