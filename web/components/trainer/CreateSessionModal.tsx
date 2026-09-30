"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Calendar, Image as ImageIcon, Users } from "lucide-react";
import { createSessionAction } from "@/app/(trainer)/actions/sessions";

type Client = { id: string; fullName: string };

export function CreateSessionModal({ clients }: { clients: Client[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleClient = (id: string) => {
    setSelectedClients(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("clientIds", selectedClients.join(","));
    await createSessionAction(formData);
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline">
        <Calendar className="w-4 h-4 mr-2" /> Schedule Class
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-ink-950 border border-slate-500/30 p-8 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-surface tracking-tight">Create Session</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-surface transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Session Name</label>
                <input required name="name" type="text" className="w-full h-11 px-4 rounded-md bg-ink-700/50 border border-slate-500/30 text-surface focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none" placeholder="e.g. Morning Fat Burn Zumba" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Date & Time</label>
                <input required name="scheduledDate" type="datetime-local" className="w-full h-11 px-4 rounded-md bg-ink-700/50 border border-slate-500/30 text-surface focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Duration (Mins)</label>
                  <input required name="durationMin" type="number" defaultValue={60} className="w-full h-11 px-4 rounded-md bg-ink-700/50 border border-slate-500/30 text-surface outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Max Participants</label>
                  <input required name="maxParticipants" type="number" defaultValue={10} className="w-full h-11 px-4 rounded-md bg-ink-700/50 border border-slate-500/30 text-surface outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Category</label>
                  <select required name="category" className="w-full h-11 px-4 rounded-md bg-ink-700/50 border border-slate-500/30 text-surface outline-none appearance-none">
                    <option value="ZUMBA_FAT_BURN">Zumba Fat Burn</option>
                    <option value="STRENGTH_ZUMBA">Strength Zumba</option>
                    <option value="DANCE_CARDIO">Dance Cardio</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Difficulty</label>
                  <select required name="difficulty" className="w-full h-11 px-4 rounded-md bg-ink-700/50 border border-slate-500/30 text-surface outline-none appearance-none">
                    <option value="ALL_LEVELS">All Levels</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Mode</label>
                <select required name="mode" className="w-full h-11 px-4 rounded-md bg-ink-700/50 border border-slate-500/30 text-surface outline-none appearance-none">
                  <option value="ONLINE">Online</option>
                  <option value="IN_PERSON">In-Person</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Cover Image URL
                </label>
                <input name="imageUrl" type="url" className="w-full h-11 px-4 rounded-md bg-ink-700/50 border border-slate-500/30 text-surface focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none" placeholder="https://example.com/image.jpg" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Select Clients
                </label>
                <div className="max-h-32 overflow-y-auto border border-slate-500/30 rounded-md bg-ink-700/30 p-2 space-y-1">
                  {clients.length === 0 && <p className="text-xs text-slate-500 p-2">No clients available.</p>}
                  {clients.map(client => (
                    <label key={client.id} className="flex items-center gap-3 p-2 hover:bg-slate-500/20 rounded cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        className="accent-accent w-4 h-4"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => toggleClient(client.id)}
                      />
                      <span className="text-sm text-slate-200">{client.fullName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" variant="accent" className="w-full h-12 mt-4" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Session"}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
