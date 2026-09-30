"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function updateClientProfileAction(formData: FormData) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { clientProfile: true }
  });

  if (!user || user.role !== "CLIENT" || !user.clientProfile) {
    throw new Error("Unauthorized");
  }

  const heightCm = formData.get("heightCm") ? parseFloat(formData.get("heightCm") as string) : null;
  const currentWeightKg = formData.get("currentWeightKg") ? parseFloat(formData.get("currentWeightKg") as string) : null;
  const startingWeightKg = formData.get("startingWeightKg") ? parseFloat(formData.get("startingWeightKg") as string) : null;
  const bloodType = formData.get("bloodType") as string || null;
  const primaryGoal = formData.get("primaryGoal") as string || null;
  const medicalConditions = formData.get("medicalConditions") as string || null;

  await prisma.clientProfile.update({
    where: { id: user.clientProfile.id },
    data: {
      heightCm,
      currentWeightKg,
      startingWeightKg,
      bloodType,
      primaryGoal,
      medicalConditions,
    }
  });

  revalidatePath("/client/profile");
  revalidatePath("/client/dashboard");
}
