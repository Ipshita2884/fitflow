"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createClientAction(formData: FormData) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const trainerUser = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { trainerProfile: true }
  });

  if (!trainerUser || trainerUser.role !== "TRAINER" || !trainerUser.trainerProfile) {
    throw new Error("Unauthorized");
  }

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string || null;

  if (!fullName || !email || !password) {
    throw new Error("Missing required fields");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("A user with this email already exists");
  }

  // Create user and link to trainer
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "CLIENT",
      clientProfile: {
        create: {
          fullName,
          phone,
          trainerId: trainerUser.trainerProfile.id
        }
      }
    }
  });

  revalidatePath("/clients");
}
