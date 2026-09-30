import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Users, Calendar, TrendingUp, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreateSessionModal } from "@/components/trainer/CreateSessionModal";

export default async function DashboardPage({ searchParams }: { searchParams: { page?: string } }) {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { trainerProfile: true, clientProfile: true },
  });

  const profile = user?.role === "TRAINER" ? user.trainerProfile : user?.clientProfile;
  const firstName = profile?.fullName?.split(" ")[0] || "User";

  // If not a trainer, they shouldn't be on this specific layout anyway
  const trainerId = user?.trainerProfile?.id;
  
  // Pagination logic
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 3;
  const skip = (page - 1) * pageSize;

  let upcomingSessions: any[] = [];
  let totalSessions = 0;
  let clients: any[] = [];

  if (trainerId) {
    totalSessions = await prisma.session.count({ where: { trainerId, status: "SCHEDULED" } });
    upcomingSessions = await prisma.session.findMany({
      where: { trainerId, status: "SCHEDULED" },
      orderBy: { scheduledDate: 'asc' },
      skip,
      take: pageSize,
      include: { bookings: true }
    });

    clients = await prisma.clientProfile.findMany({
      where: { trainerId },
      select: { id: true, fullName: true }
    });
  }

  const totalPages = Math.ceil(totalSessions / pageSize);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Dashboard overview</h1>
          <p className="text-slate-500">Welcome back, {firstName}! Here's what's happening today.</p>
        </div>
        {trainerId && <CreateSessionModal clients={clients} />}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card glass className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-positive flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Active Clients</h3>
            <p className="text-3xl font-bold text-surface">{clients.length || 42}</p>
          </div>
        </Card>

        <Card glass className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Sessions Today</h3>
            <p className="text-3xl font-bold text-surface">6</p>
          </div>
        </Card>

        <Card glass className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Completion Rate</h3>
            <p className="text-3xl font-bold text-surface">89%</p>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card glass className="p-6 min-h-[400px] flex flex-col">
            <h3 className="text-lg font-bold text-surface mb-6">Upcoming Sessions</h3>
            
            <div className="flex-1 flex flex-col space-y-4">
              {upcomingSessions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center border border-dashed border-slate-500/30 rounded-xl bg-ink-950/30 h-full">
                  <div className="text-center">
                    <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 mb-4">No sessions scheduled.</p>
                  </div>
                </div>
              ) : (
                <>
                  {upcomingSessions.map(session => (
                    <div key={session.id} className="p-4 rounded-xl border border-slate-500/20 bg-ink-700/20 flex gap-4 overflow-hidden relative group transition-colors hover:bg-ink-700/40">
                      <div className="w-24 h-24 bg-ink-950 rounded-lg shrink-0 overflow-hidden relative flex items-center justify-center border border-slate-500/30">
                        {session.imageUrl ? (
                          <img src={session.imageUrl} alt={session.name} className="object-cover w-full h-full" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-500/50" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-base font-bold text-surface">{session.name}</h4>
                        <p className="text-xs text-accent mt-1">{new Date(session.scheduledDate).toLocaleString()}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                          <span className="bg-ink-950 px-2 py-1 rounded border border-slate-500/30">{session.mode}</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {session.bookings.length} / {session.maxParticipants}</span>
                          <span>{session.durationMin} mins</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center pt-4 border-t border-slate-500/20 mt-4">
                      <Link href={`/dashboard?page=${Math.max(1, page - 1)}`} className={`p-2 rounded-md transition-colors ${page === 1 ? 'text-slate-600 pointer-events-none' : 'text-slate-300 hover:bg-slate-500/20'}`}>
                        <ChevronLeft className="w-5 h-5" />
                      </Link>
                      <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
                      <Link href={`/dashboard?page=${Math.min(totalPages, page + 1)}`} className={`p-2 rounded-md transition-colors ${page === totalPages ? 'text-slate-600 pointer-events-none' : 'text-slate-300 hover:bg-slate-500/20'}`}>
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card glass className="p-6 min-h-[400px]">
            <h3 className="text-lg font-bold text-surface mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-500/20 shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-surface">Client {i} completed workout</p>
                    <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
