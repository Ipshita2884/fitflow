import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { Activity, Flame, Target, Scale, AlertCircle, Dumbbell, Calendar, FileText, CheckCircle2, Clock } from "lucide-react";
import { ClientHeader } from "@/components/trainer/ClientHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default async function ClientOverviewPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  // Fetch summary and activity in parallel
  const [summaryRes, activityRes] = await Promise.all([
    fetch(`${API_URL}/clients/${clientId}/summary`, {
      headers: { "Authorization": `Bearer ${session.token}` },
      cache: "no-store"
    }),
    fetch(`${API_URL}/clients/${clientId}/activity?pageSize=10`, {
      headers: { "Authorization": `Bearer ${session.token}` },
      cache: "no-store"
    })
  ]);

  if (!summaryRes.ok) {
    if (summaryRes.status === 401) redirect("/auth/error?code=session_expired");
    if (summaryRes.status === 403) redirect("/unauthorized");
    if (summaryRes.status === 404) notFound();
    throw new Error("Failed to fetch client details");
  }

  const { data: summary } = await summaryRes.json();
  const activityData = activityRes.ok ? (await activityRes.json()).data : { items: [] };

  const client = summary.client;
  const fitness = summary.fitness || {};
  const goals = summary.goals || [];
  const attendance = summary.attendance || {};
  const workoutPlan = summary.currentWorkoutPlan;
  const trainerNotes = summary.trainerNotes || [];
  const recentActivities = activityData.items || [];

  // Weight Calculation
  const currentWeight = fitness.currentWeightKg || client.currentWeightKg || 0;
  const startingWeight = fitness.startingWeightKg || client.startingWeightKg || currentWeight;
  const weightChange = currentWeight && startingWeight ? Number(currentWeight) - Number(startingWeight) : 0;
  const targetWeight = fitness.targetWeightKg || client.targetWeightKg || 0;

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      <ClientHeader client={{ ...client, email: client.user?.email || client.email }} />
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card glass className="p-6 border-slate-800">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <Scale className="w-5 h-5" />
            </div>
            {weightChange !== 0 && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${weightChange < 0 ? 'bg-positive/10 text-positive border-positive/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
              </span>
            )}
          </div>
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Current Weight</h3>
          <p className="text-3xl font-extrabold text-surface mt-1">{currentWeight || '-'} <span className="text-sm font-normal text-slate-500">kg</span></p>
        </Card>

        <Card glass className="p-6 border-slate-800">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center border border-warning/20">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500">
              BMI: {fitness.bmi || '-'}
            </span>
          </div>
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Target Weight</h3>
          <p className="text-3xl font-extrabold text-surface mt-1">{targetWeight || '-'} <span className="text-sm font-normal text-slate-500">kg</span></p>
        </Card>

        <Card glass className="p-6 border-slate-800">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-positive/10 text-positive flex items-center justify-center border border-positive/20">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-positive">
              {attendance.attendanceRate || 100}%
            </span>
          </div>
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Attendance Rate</h3>
          <p className="text-3xl font-extrabold text-surface mt-1">{attendance.attendedCount || 0} <span className="text-sm font-normal text-slate-500">sessions</span></p>
        </Card>

        <Card glass className="p-6 border-slate-800">
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-400">
              Level
            </span>
          </div>
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Fitness Level</h3>
          <p className="text-xl font-bold text-surface capitalize mt-2 truncate">
            {fitness.fitnessLevel?.toLowerCase().replace('_', ' ') || 'Beginner'}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2-Column: Baseline & Workout Plan */}
        <div className="lg:col-span-2 space-y-8">
          {/* Baseline Profile */}
          <Card glass className="p-6 sm:p-8 border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-surface flex items-center gap-2 border-b border-slate-800 pb-3">
              <AlertCircle className="w-5 h-5 text-accent" /> Baseline Profile & Medical Overview
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-sm">
              <div>
                <p className="text-xs text-slate-400 mb-1">Starting Weight</p>
                <p className="font-semibold text-surface">{startingWeight ? `${startingWeight} kg` : 'Not recorded'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Height</p>
                <p className="font-semibold text-surface">{fitness.heightCm ? `${fitness.heightCm} cm` : 'Not recorded'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Primary Fitness Goal</p>
                <div className="inline-flex bg-ink-900 border border-slate-700/60 px-3 py-1 rounded-full text-xs text-surface font-semibold capitalize">
                  {fitness.primaryGoal || 'General Fitness & Toning'}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Assigned Trainer</p>
                <p className="font-semibold text-accent">{client.trainer?.fullName || 'Assigned to You'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-400 mb-1">Medical Conditions / Injury History</p>
                <p className="font-medium text-surface bg-ink-900/60 p-3.5 rounded-xl border border-slate-800 text-xs leading-relaxed">
                  {client.medicalConditions || 'No medical conditions or physical limitations reported.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Active Workout Plan */}
          <Card glass className="p-6 sm:p-8 border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-surface flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-positive" /> Active Workout Routine
              </h2>
              {workoutPlan && (
                <span className="text-xs font-semibold text-positive bg-positive/10 border border-positive/20 px-2.5 py-1 rounded-full">
                  {workoutPlan.frequency}
                </span>
              )}
            </div>

            {workoutPlan ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-surface text-base">{workoutPlan.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Started on {new Date(workoutPlan.startDate).toLocaleDateString()}
                  </p>
                </div>

                {workoutPlan.workouts && workoutPlan.workouts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Workouts</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {workoutPlan.workouts.map((w: any) => (
                        <div key={w.id} className="p-3 bg-ink-900 border border-slate-800 rounded-lg text-xs">
                          <p className="font-bold text-surface">{w.title}</p>
                          <p className="text-slate-400 mt-0.5">{w.durationMin ? `${w.durationMin} mins` : 'Flexible duration'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-500 text-xs">No active workout plan currently assigned.</p>
              </div>
            )}
          </Card>

          {/* Recent Activity Timeline */}
          <Card glass className="p-6 sm:p-8 border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-surface flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="w-5 h-5 text-blue-400" /> Recent Client Activity
            </h2>

            {recentActivities.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">No recent logged activity.</p>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((act: any) => (
                  <div key={act.id} className="flex gap-4 items-start pb-3 border-b border-slate-800/60 last:border-none last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-ink-900 border border-slate-700 flex items-center justify-center shrink-0 text-accent text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-surface">{act.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{act.description}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{new Date(act.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right 1-Column: Goals & Trainer Notes */}
        <div className="space-y-8">
          {/* Active Goals */}
          <Card glass className="p-6 border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-surface flex items-center gap-2 border-b border-slate-800 pb-3">
              <Target className="w-5 h-5 text-warning" /> Active Goals
            </h2>
            
            {goals.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 text-xs">No active goals recorded.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {goals.map((goal: any) => {
                  const progress = goal.progress || 0;
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-surface truncate pr-2">{goal.title}</span>
                        <span className="text-xs font-bold text-accent">{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-ink-950 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-accent rounded-full transition-all duration-1000" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500">
                        <span>Start: {goal.startValue ? `${goal.startValue}${goal.unit || ''}` : '-'}</span>
                        <span>Target: {goal.targetValue ? `${goal.targetValue}${goal.unit || ''}` : '-'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Trainer Private Notes */}
          <Card glass className="p-6 border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-surface flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-5 h-5 text-purple-400" /> Trainer Private Notes
            </h2>

            {trainerNotes.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-4">No private notes added yet.</p>
            ) : (
              <div className="space-y-3">
                {trainerNotes.map((note: any) => (
                  <div key={note.id} className="p-3 bg-ink-900 border border-slate-800 rounded-lg text-xs space-y-1">
                    <p className="text-slate-300 leading-relaxed">{note.content}</p>
                    <p className="text-[10px] text-slate-500 text-right">{new Date(note.createdAt).toLocaleDateString()}</p>
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
