import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { RealTimeChatPanel } from "@/components/trainer/client-profile/RealTimeChatPanel";

export default async function ClientChatPage({ params }: { params: { clientId: string } }) {
  const session = await getSession();
  if (!session || !session.userId) return notFound();

  const trainer = await prisma.user.findUnique({
    where: { id: session.userId as string },
    include: { trainerProfile: true }
  });

  const client = await prisma.clientProfile.findUnique({
    where: { id: params.clientId },
    include: { user: true }
  });

  if (!trainer?.trainerProfile || !client) return notFound();

  // Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { id: trainer.id } } },
        { participants: { some: { id: client.userId } } }
      ]
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 50
      }
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: trainer.id }, { id: client.userId }]
        }
      },
      include: { messages: true }
    });
  }

  return (
    <div className="h-[600px] flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-surface tracking-tight">Messages</h2>
        <p className="text-slate-400 text-sm">Real-time communication with {client.fullName}</p>
      </div>

      <RealTimeChatPanel 
        conversationId={conversation.id} 
        currentUserId={trainer.id}
        receiverId={client.userId}
        initialMessages={conversation.messages}
      />
    </div>
  );
}
