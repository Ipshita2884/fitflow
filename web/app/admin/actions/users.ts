"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function deleteUserAction(userId: string) {
  const session = await getSession();
  
  // Verify current user is admin
  if (!session || !session.userId) throw new Error("Unauthorized");
  
  const currentUser = await prisma.user.findUnique({
    where: { id: session.userId as string }
  });
  
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Prevent self-deletion
  if (currentUser.id === userId) {
    throw new Error("Cannot delete your own admin account.");
  }

  await prisma.user.delete({
    where: { id: userId }
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
