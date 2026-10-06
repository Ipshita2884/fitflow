"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { UserPlus, Search, AlertCircle, CheckCircle2, UserCheck, Dumbbell, Target, ArrowLeft } from "lucide-react";
import { createClientAction, associateClientAction, findClientAction } from "@/app/(trainer)/actions/clients";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function AddClientForm() {
  const [mode, setMode] = useState<"NEW" | "EXISTING">("NEW");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Existing Client Search
  const [searchIdentifier, setSearchIdentifier] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundClient, setFoundClient] = useState<any | null>(null);

  const router = useRouter();

  const handleReset = () => {
    setError(null);
    setSuccessMsg(null);
    setSearchIdentifier("");
    setFoundClient(null);
    setIsSubmitting(false);
    setIsSearching(false);
  };

  const handleFindClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchIdentifier.trim()) return;
    setIsSearching(true);
    setError(null);
    setFoundClient(null);

    try {
      const data = await findClientAction(searchIdentifier.trim());
      setFoundClient(data);
    } catch (err: any) {
      setError(err.message || "No registered client account found matching that email or phone number.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssociateClient = async () => {
    if (!foundClient) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const client = await associateClientAction({ clientId: foundClient.id });
      setSuccessMsg(`${foundClient.fullName} has been added to your client list!`);
      setTimeout(() => {
        router.push(`/clients/${client.id}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to associate client");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNewClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();
    const fullName = (formData.get("fullName") as string).trim();
    const password = (formData.get("password") as string)?.trim() || undefined;
    const phone = (formData.get("phone") as string)?.trim() || undefined;
    const age = formData.get("age") ? Number(formData.get("age")) : undefined;
    const heightCm = formData.get("heightCm") ? Number(formData.get("heightCm")) : undefined;
    const currentWeightKg = formData.get("currentWeightKg") ? Number(formData.get("currentWeightKg")) : undefined;
    const targetWeightKg = formData.get("targetWeightKg") ? Number(formData.get("targetWeightKg")) : undefined;
    const fitnessLevel = (formData.get("fitnessLevel") as string) || "BEGINNER";
    const primaryGoal = (formData.get("primaryGoal") as string)?.trim() || undefined;
    const initialNotes = (formData.get("initialNotes") as string)?.trim() || undefined;

    try {
      const client = await createClientAction({
        email,
        fullName,
        password,
        phone,
        age,
        heightCm,
        currentWeightKg,
        targetWeightKg,
        fitnessLevel,
        primaryGoal,
        initialNotes
      });

      setSuccessMsg(`Client ${fullName} created successfully! Redirecting...`);
      setTimeout(() => {
        router.push(`/clients/${client.id}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card glass className="p-6 sm:p-8 border-slate-800 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <Link 
          href="/clients"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients Roster
        </Link>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-ink-900 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => { setMode("NEW"); handleReset(); }}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mode === "NEW" ? "bg-accent text-ink-950 shadow" : "text-slate-400 hover:text-surface"}`}
          >
            Create New Client
          </button>
          <button
            type="button"
            onClick={() => { setMode("EXISTING"); handleReset(); }}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mode === "EXISTING" ? "bg-accent text-ink-950 shadow" : "text-slate-400 hover:text-surface"}`}
          >
            Find Existing Client
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-positive/10 border border-positive/20 flex items-center gap-3 text-positive text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p>{successMsg}</p>
        </div>
      )}

      {mode === "EXISTING" ? (
        <div className="space-y-6">
          <form onSubmit={handleFindClient} className="space-y-3">
            <label className="text-xs font-semibold text-slate-300">Client Email Address or Phone Number</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-500" />
                </div>
                <input 
                  type="text" 
                  value={searchIdentifier}
                  onChange={(e) => setSearchIdentifier(e.target.value)}
                  required
                  className="w-full bg-ink-900 border border-slate-700/60 rounded-lg pl-10 pr-4 py-2.5 text-sm text-surface focus:outline-none focus:border-accent"
                  placeholder="Enter client's registered email or phone..."
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchIdentifier.trim()}
                className="px-5 py-2.5 bg-accent text-ink-950 hover:bg-accent/90 font-bold text-xs rounded-lg transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
              >
                {isSearching ? "Searching..." : "Search Client"}
              </button>
            </div>
          </form>

          {foundClient && (
            <div className="p-5 bg-ink-900/90 border border-slate-700/80 rounded-xl space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-base border border-accent/30 shadow-inner">
                  {foundClient.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-surface text-base truncate">{foundClient.fullName}</h4>
                  <p className="text-xs text-slate-400 truncate">{foundClient.email} {foundClient.phone ? `• ${foundClient.phone}` : ""}</p>
                </div>
              </div>

              {foundClient.isAlreadyAssigned ? (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-warning text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  This client is already assigned to your roster.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleAssociateClient}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-accent text-ink-950 font-bold text-sm rounded-lg hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  {isSubmitting ? "Associating..." : "Associate Client to My Roster"}
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleCreateNewClient} className="space-y-6">
          {/* Section 1: Personal */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-slate-800 pb-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Personal & Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                <input 
                  name="fullName"
                  type="text" 
                  required
                  className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-surface focus:outline-none focus:border-accent"
                  placeholder="e.g. Aarav Sharma"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                <input 
                  name="email"
                  type="email" 
                  required
                  className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-surface focus:outline-none focus:border-accent"
                  placeholder="aarav@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Temporary Password</label>
                <input 
                  name="password"
                  type="text" 
                  className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-surface focus:outline-none focus:border-accent"
                  placeholder="Leave blank to auto-generate"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                <input 
                  name="phone"
                  type="tel" 
                  className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-surface focus:outline-none focus:border-accent"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Fitness Baseline */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-slate-800 pb-2 flex items-center gap-2">
              <Dumbbell className="w-4 h-4" /> Physical Baseline & Fitness Metrics
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Age</label>
                <input 
                  name="age"
                  type="number" 
                  min="1"
                  max="120"
                  className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-surface focus:outline-none focus:border-accent"
                  placeholder="28"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Height (cm)</label>
                <input 
                  name="heightCm"
                  type="number" 
                  min="50"
                  max="300"
                  className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-surface focus:outline-none focus:border-accent"
                  placeholder="175"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Current Weight (kg)</label>
                <input 
                  name="currentWeightKg"
                  type="number" 
                  step="0.1"
                  className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-surface focus:outline-none focus:border-accent"
                  placeholder="72.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Weight (kg)</label>
                <input 
                  name="targetWeightKg"
                  type="number" 
                  step="0.1"
                  className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-surface focus:outline-none focus:border-accent"
                  placeholder="68.0"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Fitness Experience Level</label>
                <select 
                  name="fitnessLevel"
                  className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-surface focus:outline-none focus:border-accent appearance-none"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Goals & Notes */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-slate-800 pb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> Primary Goal & Private Trainer Notes
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Primary Fitness Goal</label>
              <input 
                name="primaryGoal"
                type="text" 
                className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-surface focus:outline-none focus:border-accent"
                placeholder="e.g. Zumba fitness & 5kg weight loss"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Initial Private Notes</label>
              <textarea 
                name="initialNotes"
                rows={3}
                className="w-full bg-ink-900 border border-slate-700/60 rounded-lg p-3 text-xs text-surface focus:outline-none focus:border-accent resize-none"
                placeholder="Initial assessment notes, dietary habits, or medical considerations..."
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <Link
              href="/clients"
              className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-surface hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-accent text-ink-950 hover:bg-accent/90 font-bold text-xs rounded-lg transition-all shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {isSubmitting ? "Creating Client Account..." : "Create Client Account"}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}
