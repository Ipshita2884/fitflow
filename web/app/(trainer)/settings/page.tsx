import { Card } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Settings</h1>
        <p className="text-slate-500">Manage your account preferences and profile.</p>
      </div>

      <Card glass className="p-8 flex flex-col items-center justify-center min-h-[400px] border-dashed">
        <Settings className="w-12 h-12 text-slate-500 mb-4 animate-[spin_4s_linear_infinite]" />
        <h3 className="text-lg font-medium text-surface mb-2">Settings Coming Soon</h3>
        <p className="text-slate-500 text-sm text-center max-w-md mb-6">
          Account management, billing, and notification preferences will be available in the next update.
        </p>
      </Card>
    </div>
  );
}
