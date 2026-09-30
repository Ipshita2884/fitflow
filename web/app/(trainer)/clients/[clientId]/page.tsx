import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Activity, Flame, Droplets, Target, TrendingUp, Scale, AlertCircle } from "lucide-react";

export default async function ClientOverviewPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  
  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
    include: {
      user: true,
      measurements: {
        orderBy: { recordedAt: 'desc' },
        take: 2
      },
      goals: {
        where: { status: 'ACTIVE' },
        take: 3
      }
    }
  });

  if (!client) notFound();

  const currentWeight = client.measurements[0]?.weightKg || client.currentWeightKg || 0;
  const previousWeight = client.measurements[1]?.weightKg || client.startingWeightKg || 0;
  const weightChange = Number(currentWeight) - Number(previousWeight);
  const targetWeight = client.targetWeightKg || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glass className="p-5 border-slate-500/20">
          <div className="flex justify-between items-start mb-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            {weightChange !== 0 && (
              <span className={`text-xs font-bold flex items-center gap-1 ${weightChange < 0 ? 'text-positive' : 'text-warning'}`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </span>
            )}
          </div>
          <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Current Weight</h3>
          <p className="text-2xl font-bold text-surface mt-1">{currentWeight} <span className="text-sm font-normal text-slate-500">kg</span></p>
        </Card>

        <Card glass className="p-5 border-slate-500/20">
          <div className="flex justify-between items-start mb-3">
            <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              Target
            </span>
          </div>
          <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Target Weight</h3>
          <p className="text-2xl font-bold text-surface mt-1">{targetWeight} <span className="text-sm font-normal text-slate-500">kg</span></p>
        </Card>

        <Card glass className="p-5 border-slate-500/20">
          <div className="flex justify-between items-start mb-3">
            <div className="w-8 h-8 rounded-lg bg-positive/10 text-positive flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-positive flex items-center gap-1">
              85%
            </span>
          </div>
          <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Attendance</h3>
          <p className="text-2xl font-bold text-surface mt-1">24 <span className="text-sm font-normal text-slate-500">sessions</span></p>
        </Card>

        <Card glass className="p-5 border-slate-500/20">
          <div className="flex justify-between items-start mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
              Avg
            </span>
          </div>
          <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Est. Calories</h3>
          <p className="text-2xl font-bold text-surface mt-1">~450 <span className="text-sm font-normal text-slate-500">kcal/session</span></p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Baseline Profile */}
        <Card glass className="lg:col-span-2 p-6 border-slate-500/20">
          <h2 className="text-lg font-bold text-surface mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-accent" /> Fitness Baseline & Preferences
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <p className="text-sm text-slate-400 mb-1">Starting Weight</p>
              <p className="font-medium text-surface">{client.startingWeightKg || 'Not recorded'} kg</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Height</p>
              <p className="font-medium text-surface">{client.heightCm ? `${client.heightCm} cm` : 'Not recorded'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Primary Goal</p>
              <div className="inline-flex bg-ink-800 border border-slate-500/30 px-3 py-1 rounded-full text-sm text-surface font-medium capitalize">
                {client.primaryGoal?.toLowerCase().replace('_', ' ') || 'General Fitness'}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Fitness Level</p>
              <div className="inline-flex bg-ink-800 border border-slate-500/30 px-3 py-1 rounded-full text-sm text-surface font-medium capitalize">
                {client.fitnessLevel?.toLowerCase().replace('_', ' ') || 'Beginner'}
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-slate-400 mb-1">Medical Conditions / Injuries</p>
              <p className="font-medium text-surface bg-ink-950/50 p-3 rounded-lg border border-slate-500/10">
                {client.medicalConditions || 'None reported.'}
              </p>
            </div>
          </div>
        </Card>

        {/* Active Goals Tracker */}
        <Card glass className="p-6 border-slate-500/20">
          <h2 className="text-lg font-bold text-surface mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-warning" /> Active Goals
          </h2>
          
          {client.goals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No active goals recorded.</p>
              <button className="mt-4 text-xs font-bold text-accent hover:underline">
                + Add Goal
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {client.goals.map((goal) => {
                const currentVal = Number(goal.targetValue) * 0.5; // Placeholder for current value
                const progress = goal.targetValue && goal.startValue
                  ? Math.max(0, Math.min(100, Math.round(((currentVal - Number(goal.startValue)) / (Number(goal.targetValue) - Number(goal.startValue))) * 100)))
                  : 0;
                  
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-medium text-surface">{goal.title}</span>
                      <span className="text-xs text-slate-400">{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-ink-950 rounded-full overflow-hidden border border-slate-500/10">
                      <div 
                        className="h-full bg-accent rounded-full transition-all duration-1000" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{goal.startValue}</span>
                      <span>{goal.targetValue}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
