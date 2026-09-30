import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ClientManager } from "@/components/trainer/ClientManager";

export default async function ClientsPage() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const trainerUser = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { trainerProfile: true }
  });

  if (!trainerUser || !trainerUser.trainerProfile) {
    redirect("/login");
  }

  const clients = await prisma.clientProfile.findMany({
    where: { trainerId: trainerUser.trainerProfile.id },
    orderBy: { joiningDate: 'desc' }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <ClientManager clients={clients} />
    </div>
  );
}
