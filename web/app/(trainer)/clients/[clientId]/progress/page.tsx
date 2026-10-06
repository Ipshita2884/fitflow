import { getSession } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { ClientProgressViewer } from "@/components/trainer/ClientProgressViewer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default async function ClientProgressPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ from?: string; to?: string; groupBy?: string }>;
}) {
  const { clientId } = await params;
  const { from, to, groupBy } = await searchParams;
  
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  if (groupBy) query.set("groupBy", groupBy);

  // Fetch client info & progress data in parallel
  const [clientRes, progressRes] = await Promise.all([
    fetch(`${API_URL}/clients/${clientId}`, {
      headers: { "Authorization": `Bearer ${session.token}` },
      cache: "no-store"
    }),
    fetch(`${API_URL}/clients/${clientId}/progress?${query.toString()}`, {
      headers: { "Authorization": `Bearer ${session.token}` },
      cache: "no-store"
    })
  ]);

  if (!clientRes.ok || !progressRes.ok) {
    if (clientRes.status === 401 || progressRes.status === 401) redirect("/auth/error?code=session_expired");
    if (clientRes.status === 403 || progressRes.status === 403) redirect("/unauthorized");
    if (clientRes.status === 404 || progressRes.status === 404) notFound();
    throw new Error("Failed to fetch client progress analytics");
  }

  const { data: clientData } = await clientRes.json();
  const { data: progressData } = await progressRes.json();

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <ClientProgressViewer 
        clientId={clientId}
        client={clientData.client} 
        progress={progressData} 
      />
    </div>
  );
}
