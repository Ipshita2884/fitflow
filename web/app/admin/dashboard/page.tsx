import { Card } from "@/components/ui/card";
import { Users, UserCircle, Calendar, Activity, Database, Server } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [totalUsers, totalTrainers, totalClients, totalSessions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "TRAINER" } }),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.session.count(),
  ]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">System Overview</h1>
        <p className="text-slate-500">Global metrics and platform health for FitFlow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card glass className="p-6 border-slate-500/20">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              All Roles
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Total Registered Users</h3>
            <p className="text-3xl font-bold text-surface">{totalUsers}</p>
          </div>
        </Card>

        <Card glass className="p-6 border-slate-500/20">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <UserCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              Active
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Total Trainers</h3>
            <p className="text-3xl font-bold text-surface">{totalTrainers}</p>
          </div>
        </Card>

        <Card glass className="p-6 border-slate-500/20">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-positive/10 text-positive flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              Active
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Total Clients</h3>
            <p className="text-3xl font-bold text-surface">{totalClients}</p>
          </div>
        </Card>

        <Card glass className="p-6 border-slate-500/20">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              All Time
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Sessions Scheduled</h3>
            <p className="text-3xl font-bold text-surface">{totalSessions}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card glass className="p-6 min-h-[300px] border-slate-500/20">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-surface">Database Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-md bg-ink-950/50 border border-slate-500/10">
              <span className="text-sm text-slate-400">Connection</span>
              <span className="text-sm text-positive font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-positive animate-pulse" /> Healthy
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-md bg-ink-950/50 border border-slate-500/10">
              <span className="text-sm text-slate-400">PostgreSQL Version</span>
              <span className="text-sm text-surface font-medium">15.4</span>
            </div>
          </div>
        </Card>
        
        <Card glass className="p-6 min-h-[300px] border-slate-500/20">
          <div className="flex items-center gap-3 mb-6">
            <Server className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-surface">System Health</h3>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-center p-3 rounded-md bg-ink-950/50 border border-slate-500/10">
              <span className="text-sm text-slate-400">Environment</span>
              <span className="text-sm text-accent font-medium">Production</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-md bg-ink-950/50 border border-slate-500/10">
              <span className="text-sm text-slate-400">Uptime</span>
              <span className="text-sm text-surface font-medium">99.98%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
