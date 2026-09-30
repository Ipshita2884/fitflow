"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { io } from "socket.io-client";

export async function createSessionAction(formData: FormData) {
  const sessionUser = await getSession();
  if (!sessionUser || sessionUser.role !== "TRAINER") {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.userId as string },
    include: { trainerProfile: true },
  });

  const trainerId = user?.trainerProfile?.id;
  if (!trainerId) throw new Error("Trainer profile not found");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as any;
  const difficulty = formData.get("difficulty") as any;
  const durationMin = parseInt(formData.get("durationMin") as string, 10);
  const maxParticipants = parseInt(formData.get("maxParticipants") as string, 10);
  const scheduledDate = new Date(formData.get("scheduledDate") as string);
  const mode = formData.get("mode") as any;
  const imageUrl = formData.get("imageUrl") as string | null;
  const clientIdsStr = formData.get("clientIds") as string;
  const clientIds = clientIdsStr ? clientIdsStr.split(",") : [];

  // 1. Create the session
  const newSession = await prisma.session.create({
    data: {
      trainerId,
      name,
      description,
      category,
      difficulty,
      durationMin,
      maxParticipants,
      scheduledDate,
      mode,
      imageUrl,
    },
  });

  // 2. Book clients and notify them
  if (clientIds.length > 0) {
    const bookings = clientIds.map(clientId => ({
      sessionId: newSession.id,
      clientId,
    }));
    await prisma.sessionBooking.createMany({ data: bookings });

    // Fetch the client's user IDs to send notifications
    const clients = await prisma.clientProfile.findMany({
      where: { id: { in: clientIds } },
      select: { userId: true },
    });

    const notifications = clients.map(client => ({
      userId: client.userId,
      type: "BOOKING" as any,
      title: "New Session Scheduled",
      body: `You have been added to a new session: ${name} on ${scheduledDate.toLocaleDateString()}.`,
    }));

    await prisma.notification.createMany({ data: notifications });

    // Send real-time notifications via socket server
    const socket = io("http://localhost:3001");
    notifications.forEach(n => {
      socket.emit("server_emit_notification", {
        userId: n.userId,
        title: n.title,
        message: n.body,
        createdAt: new Date().toISOString()
      });
    });
    
    // Disconnect after sending
    setTimeout(() => socket.disconnect(), 1000);
  }

  revalidatePath("/dashboard");
  return { success: true };
}
