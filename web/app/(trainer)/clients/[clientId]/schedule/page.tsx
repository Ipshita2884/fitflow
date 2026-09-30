import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Calendar, Clock, MapPin, Monitor } from "lucide-react";

export default async function ClientSchedulePage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  
  const bookings = await prisma.sessionBooking.findMany({
    where: { clientId },
    include: { session: true },
    orderBy: { session: { scheduledDate: 'asc' } }
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-surface tracking-tight">Class Schedule</h2>
          <p className="text-slate-400 text-sm">Upcoming and past sessions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bookings.length === 0 ? (
          <Card glass className="p-8 flex flex-col items-center justify-center border-dashed">
            <Calendar className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-surface mb-2">No Sessions Booked</h3>
            <p className="text-slate-500 text-sm text-center">This client is not booked for any upcoming sessions.</p>
          </Card>
        ) : (
          bookings.map(b => (
            <Card key={b.id} glass className="p-5 border-slate-500/20 flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:bg-ink-700/40 transition-colors">
               <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                     {b.session.category.replace('_', ' ')}
                   </span>
                   <span className="bg-slate-500/20 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                     {b.status}
                   </span>
                 </div>
                 <h3 className="font-bold text-surface text-lg">{b.session.name}</h3>
                 
                 <div className="flex flex-wrap gap-4 mt-2">
                   <div className="flex items-center gap-1.5 text-xs text-slate-400">
                     <Calendar className="w-3.5 h-3.5" />
                     {new Date(b.session.scheduledDate).toLocaleDateString()}
                   </div>
                   <div className="flex items-center gap-1.5 text-xs text-slate-400">
                     <Clock className="w-3.5 h-3.5" />
                     {new Date(b.session.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({b.session.durationMin}m)
                   </div>
                   <div className="flex items-center gap-1.5 text-xs text-slate-400">
                     {b.session.mode === 'ONLINE' ? <Monitor className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                     {b.session.mode}
                   </div>
                 </div>
               </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
