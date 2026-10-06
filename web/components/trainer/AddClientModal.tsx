"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, Lock, Phone, AlertCircle, Search, CheckCircle2, UserCheck, Dumbbell, Target, FileText } from "lucide-react";
import { createClientAction, associateClientAction, findClientAction } from "@/app/(trainer)/actions/clients";
import { useRouter } from "next/navigation";

export function AddClientModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void 
}) {
  const [mode, setMode] = useState<"EXISTING" | "NEW">("NEW");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Existing Client Search State
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

  const handleClose = () => {
    handleReset();
    onClose();
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
      setError(err.message || "No registered client account found");
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
        handleClose();
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

      setSuccessMsg(`Client ${fullName} created successfully!`);
      setTimeout(() => {
        handleClose();
        router.push(`/clients/${client.id}`);
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-ink-950 border border-slate-700/60 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-xl w-full relative my-8"
          >
            <button 
              onClick={handleClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                <UserPlus className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-surface">Add Client</h3>
                <p className="text-xs text-slate-400">Add an existing FitFlow client or create a new client profile.</p>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-ink-900 border border-slate-800 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => { setMode("NEW"); handleReset(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${mode === "NEW" ? "bg-accent text-ink-950 shadow" : "text-slate-400 hover:text-surface"}`}
              >
                Create New Client
              </button>
              <button
                type="button"
                onClick={() => { setMode("EXISTING"); handleReset(); }}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${mode === "EXISTING" ? "bg-accent text-ink-950 shadow" : "text-slate-400 hover:text-surface"}`}
              >
                Existing FitFlow Client
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-positive/10 border border-positive/20 flex items-center gap-2 text-positive text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <p>{successMsg}</p>
              </div>
            )}

            {mode === "EXISTING" ? (
              <div className="space-y-4">
                <form onSubmit={handleFindClient} className="space-y-3">
                  <label className="text-xs font-semibold text-slate-300">Client Email or Phone Number</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-500" />
                      </div>
                      <input 
                        type="text" 
                        value={searchIdentifier}
                        onChange={(e) => setSearchIdentifier(e.target.value)}
                        required
                        className="w-full bg-ink-900 border border-slate-700/60 rounded-lg pl-10 pr-4 py-2.5 text-xs text-surface focus:outline-none focus:border-accent"
                        placeholder="Enter client's registered email or phone..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching || !searchIdentifier.trim()}
                      className="px-4 py-2.5 bg-ink-800 border border-slate-700 hover:bg-slate-700 text-surface font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSearching ? "Searching..." : "Find"}
                    </button>
                  </div>
                </form>

                {foundClient && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-ink-900 border border-slate-700/80 rounded-xl space-y-3 mt-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-sm border border-accent/30">
                        {foundClient.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-surface text-sm truncate">{foundClient.fullName}</h4>
                        <p className="text-xs text-slate-400 truncate">{foundClient.email}</p>
                      </div>
                    </div>

                    {foundClient.isAlreadyAssigned ? (
                      <div className="p-2.5 bg-warning/10 border border-warning/20 rounded-lg text-warning text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        This client is already assigned to your account.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAssociateClient}
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-accent text-ink-950 font-bold text-xs rounded-lg hover:bg-accent/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50"
                      >
                        <UserCheck className="w-4 h-4" />
                        {isSubmitting ? "Associating..." : "Add Client to My Roster"}
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            ) : (
              <form onSubmit={handleCreateNewClient} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {/* Personal Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-slate-800 pb-1 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" /> Personal & Contact Info
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Full Name *</label>
                      <input 
                        name="fullName"
                        type="text" 
                        required
                        className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-surface focus:outline-none focus:border-accent"
                        placeholder="e.g. Aarav Sharma"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Email Address *</label>
                      <input 
                        name="email"
                        type="email" 
                        required
                        className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-surface focus:outline-none focus:border-accent"
                        placeholder="aarav@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Temporary Password</label>
                      <input 
                        name="password"
                        type="text" 
                        className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-surface focus:outline-none focus:border-accent"
                        placeholder="Auto-generated if empty"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Phone Number</label>
                      <input 
                        name="phone"
                        type="tel" 
                        className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-surface focus:outline-none focus:border-accent"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                {/* Fitness Baseline */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-slate-800 pb-1 flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5" /> Fitness Baseline & Metrics
                  </h4>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Age</label>
                      <input 
                        name="age"
                        type="number" 
                        min="1"
                        max="120"
                        className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-surface focus:outline-none focus:border-accent"
                        placeholder="28"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Height (cm)</label>
                      <input 
                        name="heightCm"
                        type="number" 
                        min="50"
                        max="300"
                        className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-surface focus:outline-none focus:border-accent"
                        placeholder="175"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Weight (kg)</label>
                      <input 
                        name="currentWeightKg"
                        type="number" 
                        step="0.1"
                        className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-surface focus:outline-none focus:border-accent"
                        placeholder="72.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Target Weight (kg)</label>
                      <input 
                        name="targetWeightKg"
                        type="number" 
                        step="0.1"
                        className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-surface focus:outline-none focus:border-accent"
                        placeholder="68.0"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Fitness Level</label>
                      <select 
                        name="fitnessLevel"
                        className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-surface focus:outline-none focus:border-accent appearance-none"
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Goals & Notes */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-slate-800 pb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Initial Goal & Notes
                  </h4>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Primary Fitness Goal</label>
                    <input 
                      name="primaryGoal"
                      type="text" 
                      className="w-full bg-ink-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-surface focus:outline-none focus:border-accent"
                      placeholder="e.g. Lose 5kg in 2 months & improve endurance"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Trainer Private Notes</label>
                    <textarea 
                      name="initialNotes"
                      rows={2}
                      className="w-full bg-ink-900 border border-slate-700/60 rounded-lg p-2.5 text-xs text-surface focus:outline-none focus:border-accent resize-none"
                      placeholder="Initial assessment notes, dietary preferences, or medical history..."
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-surface hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-xs font-bold bg-accent text-ink-950 hover:bg-accent/90 rounded-lg transition-all shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmitting ? "Creating Client..." : "Create Client Account"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
