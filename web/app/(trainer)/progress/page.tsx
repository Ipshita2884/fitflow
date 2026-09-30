import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Progress Tracking</h1>
        <p className="text-slate-500">View performance metrics and analytics.</p>
      </div>

      <Card glass className="p-8 flex flex-col items-center justify-center min-h-[400px] border-dashed">
        <Activity className="w-12 h-12 text-slate-500 mb-4" />
        <h3 className="text-lg font-medium text-surface mb-2">Not Enough Data</h3>
        <p className="text-slate-500 text-sm text-center max-w-md mb-6">
          Progress analytics will appear here once your clients start logging their workouts and measurements.
        </p>
      </Card>
    </div>
  );
}
