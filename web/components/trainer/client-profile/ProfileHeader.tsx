"use client";

import { Card } from "@/components/ui/card";
import { MessageSquare, Edit, CalendarPlus, Activity, MapPin, Mail, Phone, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";

export function ProfileHeader({ client }: { client: any }) {
  const joinDate = new Date(client.user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const initials = client.fullName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) || "CL";
  const isOnline = client.user.isOnline;

  return (
    <Card className="bg-ink-950/80 backdrop-blur border-slate-500/20 p-6 shadow-xl rounded-2xl relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start w-full md:w-auto text-center sm:text-left">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-ink-800 border-2 border-slate-500/30 flex items-center justify-center text-3xl font-bold text-surface shadow-lg overflow-hidden">
              {client.profileImageUrl ? (
                <img src={client.profileImageUrl} alt={client.fullName} className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            {/* Status indicator */}
            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-ink-950 flex items-center justify-center ${isOnline ? 'bg-positive' : 'bg-slate-500'}`} title={isOnline ? 'Online' : 'Offline'}>
              <div className="w-2 h-2 rounded-full bg-white/50" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold text-surface">{client.fullName}</h1>
                <span className="bg-accent/10 text-accent text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Active
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-2 justify-center sm:justify-start">
                <span className="font-mono text-xs opacity-70">ID: {client.id.split('-')[0]}</span>
                &bull;
                <span className="capitalize">{client.fitnessLevel?.toLowerCase().replace('_', ' ') || 'Beginner'}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300 justify-center sm:justify-start">
              {client.user.email && (
                <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-500" /> {client.user.email}</div>
              )}
              {client.phone && (
                <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-500" /> {client.phone}</div>
              )}
              <div suppressHydrationWarning className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-slate-500" /> Joined {joinDate}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-end shrink-0">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 bg-ink-800 text-surface rounded-lg hover:bg-ink-700 transition-colors border border-slate-500/30 text-sm font-medium">
            <Edit className="w-4 h-4" /> Edit
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 bg-ink-800 text-surface rounded-lg hover:bg-ink-700 transition-colors border border-slate-500/30 text-sm font-medium">
            <Activity className="w-4 h-4" /> Assessment
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 bg-accent text-ink-950 rounded-lg hover:bg-accent/90 transition-colors font-bold text-sm">
            <MessageSquare className="w-4 h-4" /> Message
          </motion.button>
        </div>
      </div>
    </Card>
  );
}
