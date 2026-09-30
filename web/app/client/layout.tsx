import { ClientSidebar } from "@/components/layout/ClientSidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect("/login");
  }

  // Fetch the real user data
  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: {
      clientProfile: true,
    }
  });

  if (!user || user.role !== "CLIENT") {
    redirect("/login");
  }

  const profile = user.clientProfile;
  const fullName = profile?.fullName || "Client";
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <div className="flex h-screen bg-ink-950 overflow-hidden">
      <ClientSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-500/20 bg-ink-950/80 backdrop-blur-md flex items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <NotificationBell />
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-surface">{fullName}</div>
                <div className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-500/20 border border-slate-500/30 flex items-center justify-center text-accent font-bold">
                {initials}
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
