"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, Plus, ArrowRight } from "lucide-react";
import { AddClientModal } from "./AddClientModal";
import Link from "next/link";

export function ClientManager({ clients }: { clients: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Clients</h1>
          <p className="text-slate-500">Manage and view your active clients here.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-ink-950 font-bold px-4 py-2 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add New Client
        </button>
      </div>

      {clients.length === 0 ? (
        <Card glass className="p-8 flex flex-col items-center justify-center min-h-[400px] border-dashed">
          <Users className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-medium text-surface mb-2">No Clients Yet</h3>
          <p className="text-slate-500 text-sm text-center max-w-md mb-6">
            You don't have any clients assigned to you yet. You can add one manually using the button above.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 border border-slate-500/30 text-surface px-4 py-2 rounded-lg hover:bg-slate-500/10 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => (
            <Card key={client.id} glass className="p-6 border-slate-500/20 group hover:border-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-ink-800 flex items-center justify-center border border-slate-500/30 font-bold text-surface text-lg">
                    {client.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-surface">{client.fullName}</h3>
                    <p className="text-xs text-slate-400 capitalize">{client.fitnessLevel?.toLowerCase().replace('_', ' ') || "Beginner"}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${client.status === 'ACTIVE' ? 'bg-positive/10 text-positive' : 'bg-slate-500/20 text-slate-400'}`}>
                  {client.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-6">
                <p className="text-sm text-slate-400 flex justify-between">
                  <span>Target Weight:</span> 
                  <span className="text-surface font-medium">{client.targetWeightKg ? `${client.targetWeightKg} kg` : '-'}</span>
                </p>
                <p className="text-sm text-slate-400 flex justify-between">
                  <span>Joined:</span> 
                  <span className="text-surface font-medium">{new Date(client.joiningDate).toLocaleDateString()}</span>
                </p>
              </div>

              <Link 
                href={`/clients/${client.id}`}
                className="flex items-center justify-center gap-2 w-full py-2 bg-ink-900 border border-slate-500/30 rounded-lg text-sm font-semibold text-surface group-hover:bg-accent group-hover:text-ink-950 group-hover:border-accent transition-colors"
              >
                View 360° Profile <ArrowRight className="w-4 h-4" />
              </Link>
            </Card>
          ))}
        </div>
      )}

      <AddClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
