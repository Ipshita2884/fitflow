"use server";

import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function createClientAction(data: any) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/clients`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to create client");
  }

  const json = await res.json();
  revalidatePath("/clients");
  return json.data?.client;
}

export async function associateClientAction(payload: { email?: string; phone?: string; clientId?: string }) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/clients/associate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to associate client");
  }

  const json = await res.json();
  revalidatePath("/clients");
  return json.data?.client;
}

export async function findClientAction(identifier: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/clients/find?identifier=${encodeURIComponent(identifier)}`, {
    headers: {
      "Authorization": `Bearer ${session.token}`
    }
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to find client");
  }

  const json = await res.json();
  return json.data;
}

export async function archiveClientAction(clientId: string) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/clients/${clientId}/archive`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${session.token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to archive client");
  }

  revalidatePath("/clients");
}

export async function updateClientAction(clientId: string, formData: FormData) {
  const session = await getSession();
  if (!session || !session.userId) throw new Error("Unauthorized");

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string || undefined;
  const status = formData.get("status") as string;

  const res = await fetch(`${API_URL}/clients/${clientId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`
    },
    body: JSON.stringify({ fullName, phone, status }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to update client");
  }

  revalidatePath(`/clients`);
  revalidatePath(`/clients/${clientId}`);
}
