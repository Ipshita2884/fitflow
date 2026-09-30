import { Card } from "@/components/ui/card";
import { Activity, Flame, Droplets, Target, TrendingUp } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ClientDashboardPage() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { clientProfile: true },
  });

  const profile = user?.clientProfile;
  const firstName = profile?.fullName?.split(" ")[0] || "Client";

  // In a real app, we'd fetch this from the database (BodyMeasurement, ProgressLog)
  // For the UI demonstration, we'll scaffold the stats
  const stats = {
    weight: profile?.currentWeightKg || 68,
    targetWeight: profile?.targetWeightKg || 65,
    caloriesBurned: 1450,
    waterDrank: 2.5,
    workoutStreak: 4
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">My Progress</h1>
        <p className="text-slate-500">Welcome back, {firstName}! Keep pushing towards your goals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card glass className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-warning flex items-center gap-1">
              Goal: {Number(stats.targetWeight)} kg
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Current Weight</h3>
            <p className="text-3xl font-bold text-surface">{Number(stats.weight)} <span className="text-sm font-normal text-slate-500">kg</span></p>
          </div>
        </Card>

        <Card glass className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-positive flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> on track
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Calories Burned</h3>
            <p className="text-3xl font-bold text-surface">{stats.caloriesBurned} <span className="text-sm font-normal text-slate-500">kcal</span></p>
          </div>
        </Card>

        <Card glass className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Water Intake</h3>
            <p className="text-3xl font-bold text-surface">{stats.waterDrank} <span className="text-sm font-normal text-slate-500">L</span></p>
          </div>
        </Card>

        <Card glass className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-positive flex items-center gap-1">
              🔥 Streak
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-400 text-sm font-medium">Workouts Completed</h3>
            <p className="text-3xl font-bold text-surface">{stats.workoutStreak} <span className="text-sm font-normal text-slate-500">this week</span></p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card glass className="p-6 min-h-[400px]">
          <h3 className="text-lg font-bold text-surface mb-6">Weight Progression</h3>
          <div className="h-full flex items-center justify-center border border-dashed border-slate-500/30 rounded-xl bg-ink-950/30 p-8">
            <p className="text-slate-500 text-sm text-center">Chart visualization will appear here as you log more weight entries over time.</p>
          </div>
        </Card>
        
        <Card glass className="p-6 min-h-[400px]">
          <h3 className="text-lg font-bold text-surface mb-6">Recent Measurements</h3>
          <div className="h-full flex items-center justify-center border border-dashed border-slate-500/30 rounded-xl bg-ink-950/30 p-8">
            <p className="text-slate-500 text-sm text-center">No recent body measurements recorded. Update your profile to track changes.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
