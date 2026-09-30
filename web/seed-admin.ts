import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const email = "admin@fitflow.com";
  const password = "admin";

  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log("Admin already exists!");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "ADMIN"
    }
  });

  console.log("Admin created! Email: admin@fitflow.com, Password: admin");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
