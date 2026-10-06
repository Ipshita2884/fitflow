import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ClientManager } from "@/components/trainer/ClientManager";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default async function ClientsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ search?: string; status?: string; page?: string; pageSize?: string; sortBy?: string; sortOrder?: string }> 
}) {
  const params = await searchParams;
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", params.page);
  if (params.pageSize) query.set("pageSize", params.pageSize);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const res = await fetch(`${API_URL}/clients?${query.toString()}`, {
    headers: {
      "Authorization": `Bearer ${session.token}`
    },
    cache: "no-store"
  });

  if (!res.ok) {
    if (res.status === 401) redirect("/auth/error?code=session_expired");
    if (res.status === 403) redirect("/unauthorized");
    throw new Error("Failed to fetch clients");
  }

  const json = await res.json();
  const clients = json.items || json.data || [];
  const pagination = json.pagination || json.meta || { page: 1, pageSize: 20, totalItems: clients.length, totalPages: 1 };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <ClientManager clients={clients} pagination={pagination} />
    </div>
  );
}
