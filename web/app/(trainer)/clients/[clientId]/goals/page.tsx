import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Target, Plus } from "lucide-react";

export default async function ClientGoalsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
    include: { goals: true }
  });

  if (!client) notFound();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-surface tracking-tight">Goals & Targets</h2>
          <p className="text-slate-400 text-sm">Manage fitness objectives and milestones.</p>
        </div>
        <button className="flex items-center gap-2 bg-accent text-ink-950 px-4 py-2 rounded-lg font-bold hover:bg-accent/90 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {client.goals.length === 0 ? (
          <Card glass className="p-8 flex flex-col items-center justify-center col-span-2 border-dashed">
            <Target className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-surface mb-2">No Goals Set</h3>
            <p className="text-slate-500 text-sm text-center">Work with your client to set achievable targets.</p>
          </Card>
        ) : (
          client.goals.map(goal => {
            const currentVal = Number(goal.targetValue) * 0.5; // Placeholder
            const progress = goal.targetValue && goal.startValue
              ? Math.max(0, Math.min(100, Math.round(((currentVal - Number(goal.startValue)) / (Number(goal.targetValue) - Number(goal.startValue))) * 100)))
              : 0;
            return (
              <Card key={goal.id} glass className="p-6 border-slate-500/20 space-y-4">
                 <div className="flex justify-between items-start">
                   <div>
                     <h3 className="text-lg font-bold text-surface">{goal.title}</h3>
                     <p className="text-xs text-slate-400 capitalize">{goal.status}</p>
                   </div>
                   <span className="text-xs font-bold text-accent">{progress}%</span>
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
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
