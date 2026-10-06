import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Users, Calendar, TrendingUp, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreateSessionModal } from "@/components/trainer/CreateSessionModal";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: rawPage } = await searchParams;
  const session = await getSession();
  if (!session || !session.userId || !session.token) redirect("/login");

  const [dashboardRes, clientsRes] = await Promise.all([
    fetch(`${API_URL}/trainer/dashboard`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    }),
    fetch(`${API_URL}/clients`, {
      headers: { Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    })
  ]);

  if (!dashboardRes.ok) {
    if (dashboardRes.status === 401) redirect("/login");
    if (dashboardRes.status === 403) redirect("/unauthorized");
  }

  const dashboardPayload = dashboardRes.ok ? await dashboardRes.json() : { data: {} };
  const clientsPayload = clientsRes.ok ? await clientsRes.json() : { data: [] };

  const dashboardData = dashboardPayload.data || {};
  const kpis = dashboardData.kpis || { activeClients: 0, todaySessions: 0, attendanceRate: 100 };
  const trainer = dashboardData.trainer || {};
  const firstName = trainer.fullName?.split(" ")[0] || "Trainer";
  const upcomingSessions = dashboardData.todaySessions || [];
  const recentActivity = dashboardData.recentActivity || [];
  const clients = clientsPayload.data || [];


  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Dashboard overview</h1>
          <p className="text-slate-500">Welcome back, {firstName}! Here's what's happening today.</p>
        </div>
        <CreateSessionModal clients={clients} />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card glass className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Active Clients</h3>
            <p className="text-3xl font-bold text-surface">{kpis.activeClients}</p>
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
            <p className="text-3xl font-bold text-surface">{kpis.todaySessions}</p>
          </div>
        </Card>

        <Card glass className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Attendance Rate</h3>
            <p className="text-3xl font-bold text-surface">{kpis.attendanceRate}%</p>
          </div>
        </Card>

        <Card glass className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Upcoming Bookings</h3>
            <p className="text-3xl font-bold text-surface">{kpis.upcomingBookingsCount || 0}</p>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card glass className="p-6 min-h-[400px] flex flex-col border-slate-500/20">
            <h3 className="text-lg font-bold text-surface mb-6">Today's Sessions</h3>
            
            <div className="flex-1 flex flex-col space-y-4">
              {upcomingSessions.length === 0 ? (
                <div className="flex-1 flex items-center justify-center border border-dashed border-slate-500/30 rounded-xl bg-ink-950/30 h-full p-8">
                  <div className="text-center">
                    <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400 mb-4">No sessions scheduled for today.</p>
                  </div>
                </div>
              ) : (
                upcomingSessions.map((session: any) => (
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
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {session._count?.bookings || 0} / {session.maxParticipants}</span>
                        <span>{session.durationMin} mins</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card glass className="p-6 min-h-[400px] border-slate-500/20">
            <h3 className="text-lg font-bold text-surface mb-6">Recent Client Activity</h3>
            {recentActivity.length === 0 ? (
              <div className="text-slate-500 text-sm py-8 text-center">No recent activity recorded.</div>
            ) : (
              <div className="space-y-6">
                {recentActivity.map((act: any) => (
                  <div key={act.id} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 text-xs font-bold border border-accent/20">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-surface font-medium">{act.summary}</p>
                      <p className="text-xs text-slate-500 mt-1">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

    </div>
  );
}
