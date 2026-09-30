"use server";

import { redirect } from "next/navigation";
import { createSession, logout } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as "CLIENT" | "TRAINER";

  if (!email || !password || !fullName || !role) {
    throw new Error("All fields are required");
  }

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName, role }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Registration failed");
  }

  const data = await res.json();
  const user = data.data.user;

  // Now login to get token
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!loginRes.ok) {
    throw new Error("Failed to auto-login after registration");
  }

  const loginData = await loginRes.json();
  await createSession(user.id, user.role, loginData.data.token);

  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (user.role === "TRAINER") {
    redirect("/dashboard");
  } else {
    redirect("/client/dashboard");
  }
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("All fields are required");
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Invalid credentials");
  }

  const data = await res.json();
  const user = data.data.user;
  const token = data.data.token;

  await createSession(user.id, user.role, token);
  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (user.role === "TRAINER") {
    redirect("/dashboard");
  } else {
    redirect("/client/dashboard");
  }
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
