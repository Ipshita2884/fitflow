"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, AlertCircle, Save } from "lucide-react";
import { updateClientAction } from "@/app/(trainer)/actions/clients";

export function EditClientModal({ 
  client,
  isOpen, 
  onClose 
}: { 
  client: any;
  isOpen: boolean; 
  onClose: () => void 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData(e.currentTarget);
      await updateClientAction(client.id, formData);
      alert("Client updated successfully!");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update client");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-ink-950 border border-slate-500/30 p-6 rounded-2xl shadow-2xl max-w-md w-full relative"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-surface">Edit Client</h3>
                <p className="text-xs text-slate-400">Update client details and status.</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex gap-2 text-warning text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input 
                    name="fullName"
                    type="text" 
                    required
                    defaultValue={client.fullName}
                    className="w-full bg-ink-900 border border-slate-500/30 rounded-lg pl-10 pr-4 py-2 text-sm text-surface focus:outline-none focus:border-accent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Phone (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </div>
                  <input 
                    name="phone"
                    type="tel" 
                    defaultValue={client.phone || ""}
                    className="w-full bg-ink-900 border border-slate-500/30 rounded-lg pl-10 pr-4 py-2 text-sm text-surface focus:outline-none focus:border-accent"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Status</label>
                <select 
                  name="status"
                  defaultValue={client.status || "ACTIVE"}
                  className="w-full bg-ink-900 border border-slate-500/30 rounded-lg px-4 py-2 text-sm text-surface focus:outline-none focus:border-accent appearance-none"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="INACTIVE">Inactive (Archived)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-500/20 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-accent text-ink-950 hover:bg-accent/90 rounded-lg transition-colors shadow-lg shadow-accent/20 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : <><Save className="w-4 h-4" /> Save</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
