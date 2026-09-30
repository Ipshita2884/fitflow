import { Card } from "@/components/ui/card";
import { Calendar, Users, Image as ImageIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { CreateSessionModal } from "@/components/trainer/CreateSessionModal";

export default async function SessionsPage() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { trainerProfile: true },
  });

  const trainerId = user?.trainerProfile?.id;
  if (!trainerId) redirect("/login");

  const upcomingSessions = await prisma.session.findMany({
    where: { trainerId, status: "SCHEDULED" },
    orderBy: { scheduledDate: 'asc' },
    include: { bookings: true }
  });

  const clients = await prisma.clientProfile.findMany({
    where: { trainerId },
    select: { id: true, fullName: true }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Sessions</h1>
          <p className="text-slate-500">Schedule and manage your training sessions.</p>
        </div>
        <CreateSessionModal clients={clients} />
      </div>

      <div className="flex-1 flex flex-col space-y-4">
        {upcomingSessions.length === 0 ? (
          <Card glass className="p-8 flex flex-col items-center justify-center min-h-[400px] border-dashed">
            <Calendar className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-surface mb-2">No Upcoming Sessions</h3>
            <p className="text-slate-500 text-sm text-center max-w-md mb-6">
              Your schedule is clear. You can start booking sessions once you have active clients.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.map(sess => (
              <Card key={sess.id} glass className="p-4 rounded-xl border border-slate-500/20 bg-ink-700/20 flex flex-col overflow-hidden relative group transition-colors hover:bg-ink-700/40">
                <div className="w-full h-32 bg-ink-950 rounded-lg shrink-0 overflow-hidden relative flex items-center justify-center border border-slate-500/30 mb-4">
                  {sess.imageUrl ? (
                    <img src={sess.imageUrl} alt={sess.name} className="object-cover w-full h-full" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-500/50" />
                  )}
                  <div className="absolute top-2 right-2 bg-accent text-ink-950 text-xs font-bold px-2 py-1 rounded">
                    {sess.category.replace('_', ' ')}
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <h4 className="text-lg font-bold text-surface">{sess.name}</h4>
                  <p className="text-sm text-accent mt-1">{new Date(sess.scheduledDate).toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-500/20 text-xs text-slate-400">
                    <span className="bg-ink-950 px-2 py-1 rounded border border-slate-500/30">{sess.mode}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {sess.bookings.length} / {sess.maxParticipants}</span>
                    <span>{sess.durationMin} mins</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
