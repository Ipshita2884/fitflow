"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, LayoutDashboard, ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const REASON_MESSAGES: Record<string, string> = {
  role: "Your current user role doesn't have permission to access this page.",
  permission: "You lack the required permissions to perform this action.",
  ownership: "You don't have ownership access to this specific resource.",
  resource: "Access to this resource is restricted.",
  feature_disabled: "This feature is currently unavailable for your account.",
  unknown: "You don't have permission to access this page or perform this action.",
};

export default function Unauthorized() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const rawReason = searchParams.get("reason") || "unknown";
  const rawReturnTo = searchParams.get("returnTo");

  const [role, setRole] = useState<"ADMIN" | "TRAINER" | "CLIENT" | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Open redirect protection: strictly validate internal relative paths
  const isInternalPath = rawReturnTo && rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//") && !rawReturnTo.includes(":");
  const safeReturnTo = isInternalPath ? rawReturnTo : undefined;

  const reasonCode = REASON_MESSAGES[rawReason] ? rawReason : "unknown";
  const permissionMessage = REASON_MESSAGES[reasonCode];

  useEffect(() => {
    let isMounted = true;

    async function checkAuthUser() {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          setRole(data.data?.user?.role || "CLIENT");
        } else if (res.status === 401) {
          // If session expired between 403 and rendering, redirect to /auth/error
          window.location.href = "/auth/error?code=session_expired";
          return;
        }
      } catch (err) {
        // Fallback default
      } finally {
        if (isMounted) setLoadingUser(false);
      }
    }

    checkAuthUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // Resolve role-aware dashboard destination
  const getDashboardHref = () => {
    if (role === "ADMIN") return "/admin/dashboard";
    if (role === "TRAINER") return "/dashboard";
    return "/client/dashboard";
  };

  const handleGoBack = () => {
    if (safeReturnTo) {
      router.push(safeReturnTo);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <Card glass className="w-full max-w-md p-8 shadow-2xl border-slate-500/20 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Access Denied</h1>

        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          {permissionMessage}
        </p>

        <p className="text-xs text-slate-500 mb-8">
          Your account is authenticated, but your current permissions restrict access here. Your active session remains signed in.
        </p>

        {loadingUser ? (
          <div className="flex justify-center items-center py-4 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-accent" /> Resolving dashboard...
          </div>
        ) : (
          <div className="space-y-3">
            <Link href={getDashboardHref()}>
              <Button variant="accent" className="w-full">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Go to Dashboard
              </Button>
            </Link>

            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full border-slate-500/30 text-surface hover:bg-ink-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
