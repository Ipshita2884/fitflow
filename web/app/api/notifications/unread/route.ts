import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ count: 0, notifications: [] }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.userId as string,
        isRead: false,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ count: 0, notifications: [] }, { status: 500 });
  }
}
