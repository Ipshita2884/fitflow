"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition, useActionState } from "react";
import { resendVerificationAction } from "../actions";
import { CheckCircle2, AlertTriangle, MailCheck, Loader2, ArrowLeft, RefreshCw } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "already_verified" | "error" | "no_token">("loading");
  const [message, setMessage] = useState("");
  const [showResend, setShowResend] = useState(false);

  const [resendState, resendAction, isResendPending] = useActionState(resendVerificationAction, undefined);

  useEffect(() => {
    if (!token) {
      setStatus("no_token");
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        const res = await fetch(`${API_URL}/auth/verify-email/${token}`);
        const data = await res.json().catch(() => ({}));

        if (!isMounted) return;

        if (res.ok) {
          if (data.message?.includes("already been verified")) {
            setStatus("already_verified");
          } else {
            setStatus("success");
          }
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "This email verification link is invalid, expired, or has already been used.");
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus("error");
        setMessage("Unable to connect to the authentication server. Please check your connection.");
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="w-full max-w-md my-8">
      <Card glass className="p-8 shadow-2xl border-slate-500/20 text-center">
        {/* Loading State */}
        {status === "loading" && (
          <div className="py-6">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-surface mb-2 tracking-tight">Verifying your email...</h1>
            <p className="text-slate-400 text-sm">Please wait while we verify your FitFlow account.</p>
          </div>
        )}

        {/* Success State */}
        {(status === "success" || status === "already_verified") && (
          <div>
            <div className="w-12 h-12 rounded-full bg-positive/10 text-positive flex items-center justify-center mx-auto mb-4 border border-positive/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold text-surface mb-2 tracking-tight">
              {status === "already_verified" ? "Email Already Verified" : "Email Verified Successfully!"}
            </h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              {message}
            </p>

            <Link href="/login">
              <Button variant="accent" className="w-full">
                Continue to Login
              </Button>
            </Link>
          </div>
        )}

        {/* Error / No Token State */}
        {(status === "error" || status === "no_token") && (
          <div>
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-bold text-surface mb-2 tracking-tight">
              {status === "no_token" ? "Invalid Verification Link" : "Verification Failed"}
            </h1>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              {status === "no_token"
                ? "This email verification link is missing or incomplete. Please request a new verification email."
                : message}
            </p>

            {showResend ? (
              <form action={resendAction} className="space-y-4 mb-6">
                {resendState?.error && (
                  <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                    {resendState.error}
                  </div>
                )}
                {resendState?.success && (
                  <div className="p-3 text-sm text-positive bg-positive/10 border border-positive/20 rounded-md">
                    {resendState.message}
                  </div>
                )}
                <div className="text-left space-y-1">
                  <label htmlFor="email" className="text-xs font-medium text-slate-300">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full h-10 px-3 rounded-md bg-ink-950 border border-slate-500/30 text-surface text-sm focus:outline-none focus:border-accent"
                    placeholder="you@example.com"
                  />
                </div>
                <Button type="submit" variant="accent" className="w-full" disabled={isResendPending}>
                  {isResendPending ? "Sending..." : "Send Verification Email"}
                </Button>
              </form>
            ) : (
              <Button
                onClick={() => setShowResend(true)}
                variant="outline"
                className="w-full mb-6 border-slate-500/30 text-surface hover:bg-ink-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Resend Verification Email
              </Button>
            )}

            <Link href="/login" className="inline-flex items-center text-sm text-slate-400 hover:text-surface transition-colors gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
