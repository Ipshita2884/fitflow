"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction } from "../actions";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [state, action, isPending] = useActionState(forgotPasswordAction, undefined);

  if (state?.success) {
    return (
      <div className="w-full max-w-md">
        <Card glass className="p-8 shadow-2xl border-slate-500/20 text-center">
          <div className="w-12 h-12 rounded-full bg-positive/10 text-positive flex items-center justify-center mx-auto mb-4 border border-positive/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold text-surface mb-2 tracking-tight">Check your email</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {state.message || "If an account exists for this email, we've sent instructions to reset your password."}
          </p>

          <p className="text-xs text-slate-500 mb-8">
            Please check your inbox and spam folder.
          </p>

          <Link href="/login">
            <Button variant="accent" className="w-full">
              Back to Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <Card glass className="p-8 shadow-2xl border-slate-500/20">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4 border border-accent/30">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Forgot Password</h1>
          <p className="text-slate-500 text-sm">
            Enter your registered email address and we'll send you a secure password reset link.
          </p>
        </div>

        <form action={action} className="space-y-6">
          {state?.error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-200">Email Address</label>
            <input 
              id="email"
              name="email"
              type="email" 
              required
              className="w-full h-11 px-4 rounded-md bg-ink-950 border border-slate-500/30 text-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300" 
              placeholder="you@example.com" 
            />
          </div>

          <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
            {isPending ? "Sending Link..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/login" className="inline-flex items-center text-sm text-slate-400 hover:text-surface transition-colors gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
