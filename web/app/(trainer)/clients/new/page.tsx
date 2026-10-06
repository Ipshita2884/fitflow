import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { AddClientForm } from "@/components/trainer/AddClientForm";

export default async function NewClientPage() {
  const session = await getSession();
  if (!session || !session.userId) redirect("/login");

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-surface tracking-tight mb-2">Add New Client</h1>
        <p className="text-slate-400 text-sm">
          Add an existing FitFlow client to your roster or create a brand new client account with baseline metrics.
        </p>
      </div>

      <AddClientForm />
    </div>
  );
}
