"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, LogIn, Home, HelpCircle } from "lucide-react";
import { useEffect } from "react";
import { logoutAction } from "../actions";

const SAFE_ERROR_MESSAGES: Record<string, { title: string; body: string }> = {
  session_expired: {
    title: "Session Expired",
    body: "Your session has expired or is no longer valid. Please sign in again to continue.",
  },
  session_invalid: {
    title: "Invalid Session",
    body: "Your authentication session is invalid. Please sign in with your credentials.",
  },
  unauthorized: {
    title: "Authentication Required",
    body: "You need to be signed in to access this page.",
  },
  authentication_failed: {
    title: "Authentication Failed",
    body: "We couldn't authenticate your request. Please sign in again.",
  },
  refresh_failed: {
    title: "Session Renewal Failed",
    body: "Your session could not be automatically renewed. Please sign in again.",
  },
  account_disabled: {
    title: "Account Unavailable",
    body: "Your account is currently unavailable. Please contact support.",
  },
  verification_required: {
    title: "Email Verification Required",
    body: "Please verify your email address before accessing your account.",
  },
  unknown: {
    title: "Authentication Error",
    body: "We couldn't complete your request. Please sign in again to continue.",
  },
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const rawCode = searchParams.get("code") || "unknown";
  const rawReturnTo = searchParams.get("returnTo");

  // Whitelist error code
  const errorCode = SAFE_ERROR_MESSAGES[rawCode] ? rawCode : "unknown";
  const errorInfo = SAFE_ERROR_MESSAGES[errorCode];

  // Open redirect protection: strictly validate internal path
  const isInternalPath = rawReturnTo && rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//") && !rawReturnTo.includes(":");
  const safeReturnTo = isInternalPath ? rawReturnTo : undefined;

  // Clear any stale client session cookie when landing on auth error
  useEffect(() => {
    logoutAction().catch(() => {});
  }, []);

  const loginHref = safeReturnTo ? `/login?returnTo=${encodeURIComponent(safeReturnTo)}` : "/login";

  return (
    <div className="w-full max-w-md my-8">
      <Card glass className="p-8 shadow-2xl border-slate-500/20 text-center">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-bold text-surface mb-2 tracking-tight">
          {errorInfo.title}
        </h1>

        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          {errorInfo.body}
        </p>

        <div className="space-y-3">
          <Link href={loginHref}>
            <Button variant="accent" className="w-full">
              <LogIn className="w-4 h-4 mr-2" /> Sign In Again
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full border-slate-500/30 text-surface hover:bg-ink-800">
              <Home className="w-4 h-4 mr-2" /> Go to Home
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-500/20 flex justify-center items-center text-xs text-slate-500 gap-2">
          <HelpCircle className="w-3.5 h-3.5" /> Need help? <Link href="/login" className="text-accent hover:underline">Contact Support</Link>
        </div>
      </Card>
    </div>
  );
}
