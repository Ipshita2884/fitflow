import { Card } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Monitor, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ClientSchedulePage() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { clientProfile: true },
  });

  const clientId = user?.clientProfile?.id;
  if (!clientId) redirect("/login");

  // Fetch all bookings for this client
  const bookings = await prisma.sessionBooking.findMany({
    where: { clientId },
    include: {
      session: true
    },
    orderBy: {
      session: {
        scheduledDate: 'asc'
      }
    }
  });

  const upcomingBookings = bookings.filter(b => new Date(b.session.scheduledDate) >= new Date());
  const pastBookings = bookings.filter(b => new Date(b.session.scheduledDate) < new Date());

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">My Schedule</h1>
        <p className="text-slate-500">View the sessions your trainer has scheduled for you.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-surface flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" /> Upcoming Sessions
        </h2>
        
        {upcomingBookings.length === 0 ? (
          <Card glass className="p-12 text-center border-dashed border-slate-500/30">
            <div className="w-16 h-16 bg-slate-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-surface mb-2">No upcoming sessions</h3>
            <p className="text-slate-400">Your trainer hasn't scheduled any new sessions for you yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <Card key={booking.id} glass className="p-4 flex gap-6 overflow-hidden relative group">
                <div className="w-32 h-32 bg-ink-950 rounded-lg shrink-0 overflow-hidden relative flex items-center justify-center border border-slate-500/30">
                  {booking.session.imageUrl ? (
                    <img src={booking.session.imageUrl} alt={booking.session.name} className="object-cover w-full h-full" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-500/50" />
                  )}
                  <div className="absolute top-2 left-2 bg-ink-950/80 backdrop-blur text-xs font-bold px-2 py-1 rounded text-surface">
                    {new Date(booking.session.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-accent text-ink-950 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {booking.session.category.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-surface">{booking.session.name}</h3>
                      <p className="text-sm text-slate-400 mt-1 line-clamp-1">{booking.session.description || "No description provided."}</p>
                    </div>
                    <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-300">
                      <Clock className="w-4 h-4 text-slate-500" />
                      {new Date(booking.session.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({booking.session.durationMin} min)
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-300">
                      {booking.session.mode === "ONLINE" ? (
                        <><Monitor className="w-4 h-4 text-slate-500" /> Online Session</>
                      ) : (
                        <><MapPin className="w-4 h-4 text-slate-500" /> In-Person</>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {pastBookings.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-slate-500/20">
          <h2 className="text-xl font-semibold text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Past Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70 hover:opacity-100 transition-opacity">
            {pastBookings.map((booking) => (
              <div key={booking.id} className="p-4 rounded-xl border border-slate-500/20 bg-ink-950 flex gap-4">
                <div className="w-16 h-16 bg-ink-700 rounded-lg shrink-0 overflow-hidden relative flex items-center justify-center">
                  {booking.session.imageUrl ? (
                    <img src={booking.session.imageUrl} alt={booking.session.name} className="object-cover w-full h-full grayscale" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-500/50" />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-slate-500/20 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {booking.session.category.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-surface">{booking.session.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{new Date(booking.session.scheduledDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
