import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/trainer/client-profile/ProfileHeader";
import { ClientTabsNavigation } from "@/components/trainer/client-profile/ClientTabsNavigation";

export default async function ClientProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
    include: {
      user: true,
      trainer: true,
    }
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0a]">
      {/* Scrollable container for the profile content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <ProfileHeader client={client} />
          
          <div className="flex flex-col lg:flex-row gap-6">
            <ClientTabsNavigation clientId={client.id} />
            
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
