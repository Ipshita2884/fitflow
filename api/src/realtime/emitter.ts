import type { Server } from 'socket.io';

let io: Server | null = null;

/** Called once from server.ts after the Socket.IO server is created. */
export function attachIO(server: Server) {
  io = server;
}

/**
 * Emit to a specific room. Rooms are joined only after the socket auth
 * middleware verifies the connecting user is allowed in that room — see
 * realtime/socket-server.ts. Services never touch Socket.IO directly, so
 * every emit path goes through the same authorization boundary.
 */
export function emitToRoom(room: string, event: string, payload: unknown) {
  if (!io) return; // no-op if realtime hasn't booted yet (e.g. in tests)
  io.to(room).emit(event, payload);
}
