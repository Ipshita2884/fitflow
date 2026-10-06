"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, Plus, ArrowRight, Search, Archive, RefreshCw, Mail, Phone, Calendar, Target, Activity } from "lucide-react";
import { AddClientModal } from "./AddClientModal";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { archiveClientAction } from "@/app/(trainer)/actions/clients";

interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function ClientManager({ 
  clients, 
  pagination 
}: { 
  clients: any[]; 
  pagination: PaginationMeta; 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<{ id: string; name: string } | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQueryParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateQueryParams({ search: e.target.value || null, page: "1" });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ status: e.target.value || null, page: "1" });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [sortBy, sortOrder] = e.target.value.split(":");
    updateQueryParams({ sortBy: sortBy || null, sortOrder: sortOrder || null, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: newPage.toString() });
  };

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    try {
      await archiveClientAction(archiveTarget.id);
      setArchiveTarget(null);
    } catch (err) {
      alert("Failed to archive client");
    } finally {
      setIsArchiving(false);
    }
  };

  const currentSort = `${searchParams.get("sortBy") || "createdAt"}:${searchParams.get("sortOrder") || "desc"}`;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Client Roster</h1>
          <p className="text-slate-400">View, search, filter, and manage your assigned clients.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-ink-950 font-bold px-4 py-2.5 rounded-lg shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all text-sm"
        >
          <Plus className="w-5 h-5" /> Add New Client
        </button>
      </div>

      {/* Search, Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input 
            type="text"
            defaultValue={searchParams.get("search") || ""}
            onChange={handleSearch}
            className="w-full bg-ink-950/80 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-surface placeholder-slate-500 focus:outline-none focus:border-accent"
            placeholder="Search by client name, email, or phone..."
          />
        </div>

        <div className="flex gap-3">
          <select 
            defaultValue={searchParams.get("status") || "ACTIVE"}
            onChange={handleStatusChange}
            className="bg-ink-950/80 border border-slate-700/50 rounded-lg px-3.5 py-2.5 text-sm text-surface focus:outline-none focus:border-accent appearance-none min-w-[130px]"
          >
            <option value="ACTIVE">Active Clients</option>
            <option value="ALL">All Clients</option>
            <option value="PAUSED">Paused</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select 
            value={currentSort}
            onChange={handleSortChange}
            className="bg-ink-950/80 border border-slate-700/50 rounded-lg px-3.5 py-2.5 text-sm text-surface focus:outline-none focus:border-accent appearance-none min-w-[140px]"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {clients.length === 0 ? (
        <Card glass className="p-12 flex flex-col items-center justify-center min-h-[350px] border-dashed text-center">
          <Users className="w-14 h-14 text-slate-600 mb-4 stroke-1" />
          <h3 className="text-xl font-bold text-surface mb-2">
            {searchParams.get("search") ? "No matching clients" : "No Clients Roster Yet"}
          </h3>
          <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
            {searchParams.get("search")
              ? "We couldn't find any clients matching your search criteria. Try refining your keywords or status filters."
              : "You haven't assigned any active clients to your account yet. Click below to add your first client."}
          </p>
          {!searchParams.get("search") && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 border border-slate-700 text-surface px-5 py-2.5 rounded-lg hover:bg-slate-800/50 transition-colors text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Add Client Now
            </button>
          )}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {clients.map(client => (
              <Card key={client.id} glass className="p-6 border-slate-800/80 group hover:border-accent/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-ink-900 flex items-center justify-center border border-slate-700 font-bold text-surface text-base shadow-inner">
                        {client.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-surface text-base group-hover:text-accent transition-colors">{client.fullName}</h3>
                        <p className="text-xs text-slate-400 capitalize">{client.fitnessLevel?.toLowerCase().replace('_', ' ') || "Beginner"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${client.status === 'ACTIVE' ? 'bg-positive/10 text-positive border border-positive/20' : client.status === 'INACTIVE' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                        {client.status === 'INACTIVE' ? 'ARCHIVED' : client.status}
                      </span>
                      {client.status !== 'INACTIVE' && (
                        <button 
                          onClick={() => setArchiveTarget({ id: client.id, name: client.fullName })}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-md hover:bg-slate-800/60"
                          title="Archive Client"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 py-3 border-y border-slate-800/60 text-xs text-slate-400 mb-4">
                    {client.email && (
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </p>
                    )}
                    {client.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{client.phone}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Joined {new Date(client.joiningDate).toLocaleDateString()}</span>
                    </p>
                  </div>

                  {/* Quick Stats Grid */}
                  {client.stats && (
                    <div className="grid grid-cols-3 gap-2 text-center p-2.5 bg-ink-950/60 border border-slate-800/50 rounded-lg mb-4 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Attendance</span>
                        <span className="font-semibold text-surface">{client.stats.attendanceRate}%</span>
                      </div>
                      <div className="border-x border-slate-800">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Active Goals</span>
                        <span className="font-semibold text-surface">{client.stats.activeGoals}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Target Wt</span>
                        <span className="font-semibold text-surface">{client.targetWeightKg ? `${client.targetWeightKg}kg` : '-'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Link 
                  href={`/clients/${client.id}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-ink-900 border border-slate-700/70 rounded-lg text-xs font-bold text-surface group-hover:bg-accent group-hover:text-ink-950 group-hover:border-accent transition-all mt-2"
                >
                  View Client Profile <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
            ))}
          </div>

          {/* Pagination Bar */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-800 pt-6 text-xs text-slate-400">
              <div>
                Showing page <span className="font-semibold text-surface">{pagination.page}</span> of <span className="font-semibold text-surface">{pagination.totalPages}</span> ({pagination.totalItems} total clients)
              </div>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="px-3 py-1.5 rounded border border-slate-700 text-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="px-3 py-1.5 rounded border border-slate-700 text-surface disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Archive Confirmation Modal */}
      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card glass className="p-6 max-w-md w-full border-rose-500/30 space-y-4">
            <h3 className="text-xl font-bold text-surface">Archive Client?</h3>
            <p className="text-sm text-slate-400">
              Are you sure you want to archive <span className="text-surface font-semibold">{archiveTarget.name}</span>? They will be removed from your active client list, but all historical workouts, attendance, and measurements will be safely preserved.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={isArchiving}
                onClick={() => setArchiveTarget(null)}
                className="px-4 py-2 rounded-lg border border-slate-700 text-sm font-semibold text-surface hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isArchiving}
                onClick={confirmArchive}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50"
              >
                {isArchiving ? "Archiving..." : "Archive Client"}
              </button>
            </div>
          </Card>
        </div>
      )}

      <AddClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
