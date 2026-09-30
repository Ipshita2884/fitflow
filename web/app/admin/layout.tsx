import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || !session.userId) {
    redirect("/login");
  }

  // Fetch the real user data
  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
  });

  if (!user || user.role !== "ADMIN") {
    // If they aren't an admin, kick them back out
    redirect("/login");
  }

  const initials = "AD";

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-500/20 bg-[#050505]/90 backdrop-blur-md flex items-center justify-end px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-medium text-warning">System Administrator</div>
              <div className="text-xs text-slate-500">{user.email}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning/20 border border-warning/50 flex items-center justify-center text-warning font-bold">
              {initials}
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
