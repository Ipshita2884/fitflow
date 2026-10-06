import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { attachIO } from './emitter';
import { prisma } from '../lib/prisma';

export interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    role: string;
  };
}

export function setupSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  attachIO(io);

  // Handshake authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid or expired authentication token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.user?.userId;
    if (!userId) return;

    // Join personal user room
    socket.join(`user:${userId}`);

    // Update online status in database
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: true, lastSeenAt: new Date() },
    }).catch(() => {});

    // Automatically join all conversations the user is a participant of
    const participants = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    }).catch(() => []);

    participants.forEach((p) => {
      socket.join(`conversation:${p.conversationId}`);
    });

    // Join trainer room if applicable
    if (socket.user?.role === 'TRAINER') {
      const trainer = await prisma.trainerProfile.findUnique({ where: { userId } }).catch(() => null);
      if (trainer) socket.join(`trainer:${trainer.id}`);
    }

    // Real-time Event Listeners
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', { conversationId, userId });
    });

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { conversationId, userId });
    });

    socket.on('disconnect', async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: false, lastSeenAt: new Date() },
      }).catch(() => {});
    });
  });

  return io;
}
