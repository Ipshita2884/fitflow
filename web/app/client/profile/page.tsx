import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { updateClientProfileAction } from "../actions/profile";
import { User, Activity, Droplet, Target, ShieldAlert } from "lucide-react";

export default async function ClientProfilePage() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { clientProfile: true }
  });

  if (!user || !user.clientProfile) redirect("/login");
  const profile = user.clientProfile;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface tracking-tight">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Update your physiological metrics so your trainer can optimize your plans.</p>
      </div>

      <Card glass className="p-8 border-slate-500/20">
        <form action={updateClientProfileAction} className="space-y-8">
          
          {/* Header Info (Read-only) */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-500/20">
            <div className="w-16 h-16 rounded-2xl bg-ink-800 flex items-center justify-center border-2 border-slate-500/30 text-2xl font-bold text-surface">
              {profile.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface">{profile.fullName}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" /> Height (cm)
              </label>
              <input 
                name="heightCm"
                type="number" 
                step="0.01"
                defaultValue={profile.heightCm?.toString() || ""}
                className="w-full bg-ink-900 border border-slate-500/30 rounded-lg px-4 py-2.5 text-surface focus:outline-none focus:border-accent"
                placeholder="e.g. 175"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-500" /> Blood Type
              </label>
              <select 
                name="bloodType"
                defaultValue={profile.bloodType || ""}
                className="w-full bg-ink-900 border border-slate-500/30 rounded-lg px-4 py-2.5 text-surface focus:outline-none focus:border-accent"
              >
                <option value="">Unknown / Prefer not to say</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Target className="w-4 h-4 text-warning" /> Primary Goal
              </label>
              <select 
                name="primaryGoal"
                defaultValue={profile.primaryGoal || ""}
                className="w-full bg-ink-900 border border-slate-500/30 rounded-lg px-4 py-2.5 text-surface focus:outline-none focus:border-accent"
              >
                <option value="">Select a goal</option>
                <option value="WEIGHT_LOSS">Weight Loss</option>
                <option value="MUSCLE_GAIN">Muscle Gain</option>
                <option value="ENDURANCE">Endurance</option>
                <option value="FLEXIBILITY">Flexibility & Mobility</option>
                <option value="GENERAL_FITNESS">General Fitness</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Starting Weight (kg)</label>
                <input 
                  name="startingWeightKg"
                  type="number" 
                  step="0.1"
                  defaultValue={profile.startingWeightKg?.toString() || ""}
                  className="w-full bg-ink-900 border border-slate-500/30 rounded-lg px-4 py-2.5 text-surface focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Current Weight (kg)</label>
                <input 
                  name="currentWeightKg"
                  type="number" 
                  step="0.1"
                  defaultValue={profile.currentWeightKg?.toString() || ""}
                  className="w-full bg-ink-900 border border-slate-500/30 rounded-lg px-4 py-2.5 text-surface focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-400" /> Medical Conditions / Injuries
            </label>
            <textarea 
              name="medicalConditions"
              defaultValue={profile.medicalConditions || ""}
              placeholder="List any past injuries, surgeries, or medical conditions your trainer should be aware of..."
              className="w-full h-24 bg-ink-900 border border-slate-500/30 rounded-lg p-4 text-surface focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit"
              className="bg-accent text-ink-950 font-bold px-8 py-3 rounded-lg hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
            >
              Save Profile Updates
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
