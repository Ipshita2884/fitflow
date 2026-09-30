import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { PrivateNotesEditor } from "@/components/trainer/client-profile/PrivateNotesEditor";

export default async function ClientNotesPage({ params }: { params: { clientId: string } }) {
  const session = await getSession();
  if (!session || !session.userId) return notFound();

  const trainer = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { trainerProfile: true }
  });

  if (!trainer?.trainerProfile) return notFound();

  const notes = await prisma.trainerPrivateNote.findMany({
    where: { 
      clientId: params.clientId,
      trainerId: trainer.trainerProfile.id 
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-surface tracking-tight flex items-center gap-2">
          <span className="bg-warning/10 text-warning px-2 py-1 rounded text-xs uppercase tracking-widest font-black border border-warning/20">Private</span>
          Trainer Notes
        </h2>
        <p className="text-slate-400 text-sm mt-1">These notes are strictly for your eyes only. The client cannot see them.</p>
      </div>

      <PrivateNotesEditor 
        clientId={params.clientId} 
        trainerProfileId={trainer.trainerProfile.id}
        initialNotes={notes} 
      />
    </div>
  );
}
