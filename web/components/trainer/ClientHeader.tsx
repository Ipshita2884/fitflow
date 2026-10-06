"use client";

import { useState } from "react";
import { EditClientModal } from "./EditClientModal";
import { Edit, Mail, Phone, Calendar, MessageSquare, Dumbbell, Utensils, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ClientHeader({ client }: { client: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-ink-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link 
          href="/clients"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-surface transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Roster
        </Link>
        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${client.status === 'ACTIVE' ? 'bg-positive/10 text-positive border-positive/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
          {client.status} CLIENT
        </span>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-ink-900 border-2 border-slate-700 flex items-center justify-center font-bold text-surface text-xl sm:text-2xl shadow-xl text-accent">
            {client.fullName ? client.fullName.substring(0, 2).toUpperCase() : "CL"}
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-surface tracking-tight">{client.fullName}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              {client.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {client.email}
                </span>
              )}
              {client.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" /> {client.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Joined {new Date(client.joiningDate || client.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Workspace Actions */}
        <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
          <Link
            href="/messages"
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-ink-900 border border-slate-700 hover:bg-slate-800 text-surface text-xs font-semibold px-4 py-2.5 rounded-lg transition-all"
          >
            <MessageSquare className="w-4 h-4 text-accent" /> Message
          </Link>
          <Link
            href="/trainer/workouts/new"
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-ink-900 border border-slate-700 hover:bg-slate-800 text-surface text-xs font-semibold px-4 py-2.5 rounded-lg transition-all"
          >
            <Dumbbell className="w-4 h-4 text-positive" /> Assign Workout
          </Link>
          <Link
            href="/trainer/nutrition/new"
            className="flex-1 lg:flex-initial flex items-center justify-center gap-2 bg-ink-900 border border-slate-700 hover:bg-slate-800 text-surface text-xs font-semibold px-4 py-2.5 rounded-lg transition-all"
          >
            <Utensils className="w-4 h-4 text-warning" /> Assign Diet
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-accent text-ink-950 font-bold px-4 py-2.5 rounded-lg hover:bg-accent/90 transition-all text-xs shadow-lg shadow-accent/20"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        </div>
      </div>

      <EditClientModal client={client} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
