"use server";

import { redirect } from "next/navigation";
import { createSession, logout } from "@/lib/session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function signupAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const fullName = formData.get("fullName") as string;
  const role = formData.get("role") as "CLIENT" | "TRAINER";
  const termsAccepted = formData.get("termsAccepted") === "on";

  if (!email || !password || !fullName || !role) {
    return { error: "All required fields must be filled out" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (!termsAccepted) {
    return { error: "You must accept the Terms of Service and Privacy Policy" };
  }

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, fullName, role, termsAccepted: true }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    return { error: errorData.message || "Registration failed" };
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
    return { error: "Failed to auto-login after registration" };
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

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "All fields are required" };
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    return { error: errorData.message || "Invalid credentials" };
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

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.message || "Failed to process request. Please try again later." };
    }

    const data = await res.json();
    return { success: true, message: data.message };
  } catch (err) {
    return { error: "Unable to connect to the server. Please check your connection and try again." };
  }
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) {
    return { error: "Reset token is missing or invalid." };
  }

  if (!password || !confirmPassword) {
    return { error: "Please fill out all required fields." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.message || "Failed to reset password. Please try again." };
    }

    const data = await res.json();
    return { success: true, message: data.message };
  } catch (err) {
    return { error: "Unable to connect to the server. Please check your connection and try again." };
  }
}

export async function resendVerificationAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  try {
    const res = await fetch(`${API_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return { error: errorData.message || "Failed to resend verification link." };
    }

    const data = await res.json();
    return { success: true, message: data.message };
  } catch (err) {
    return { error: "Unable to connect to the server. Please check your connection." };
  }
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}



