"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "../actions";
import { Eye, EyeOff, KeyRound, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, action, isPending] = useActionState(resetPasswordAction, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score === 0) return { label: "Very Weak", color: "bg-red-500", percent: 15 };
    if (score === 1) return { label: "Weak", color: "bg-red-500", percent: 25 };
    if (score === 2) return { label: "Fair", color: "bg-amber-500", percent: 50 };
    if (score === 3) return { label: "Good", color: "bg-blue-500", percent: 75 };
    return { label: "Strong", color: "bg-green-500", percent: 100 };
  };

  const strength = getPasswordStrength(password);

  // Missing or empty token state
  if (!token) {
    return (
      <div className="w-full max-w-md">
        <Card glass className="p-8 shadow-2xl border-slate-500/20 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold text-surface mb-2 tracking-tight">Invalid Reset Link</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            This password reset link is missing or invalid. Please request a new password reset link.
          </p>

          <div className="space-y-3">
            <Link href="/forgot-password">
              <Button variant="accent" className="w-full">
                Request New Reset Link
              </Button>
            </Link>
            <Link href="/login" className="block text-sm text-slate-400 hover:text-surface pt-2">
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Success state
  if (state?.success) {
    return (
      <div className="w-full max-w-md">
        <Card glass className="p-8 shadow-2xl border-slate-500/20 text-center">
          <div className="w-12 h-12 rounded-full bg-positive/10 text-positive flex items-center justify-center mx-auto mb-4 border border-positive/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-bold text-surface mb-2 tracking-tight">Password Reset Successfully</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Your password has been changed. For your security, existing sessions have been signed out.
          </p>

          <Link href="/login">
            <Button variant="accent" className="w-full">
              Continue to Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md my-8">
      <Card glass className="p-8 shadow-2xl border-slate-500/20">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4 border border-accent/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Reset Password</h1>
          <p className="text-slate-500 text-sm">
            Create a strong new password for your FitFlow account.
          </p>
        </div>

        <form action={action} className="space-y-5">
          <input type="hidden" name="token" value={token} />

          {state?.error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-200">New Password</label>
            <div className="relative">
              <input 
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-4 pr-10 rounded-md bg-ink-950 border border-slate-500/30 text-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300" 
                placeholder="••••••••" 
              />
              <button 
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-surface transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {password.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Strength</span>
                  <span className="font-semibold text-slate-200">{strength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-ink-950 rounded-full overflow-hidden border border-slate-500/20">
                  <div 
                    className={`h-full ${strength.color} transition-all duration-500`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-200">Confirm Password</label>
            <input 
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="w-full h-11 px-4 rounded-md bg-ink-950 border border-slate-500/30 text-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300" 
              placeholder="••••••••" 
            />
          </div>

          <Button type="submit" variant="accent" className="w-full mt-2" disabled={isPending}>
            {isPending ? "Updating Password..." : "Reset Password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="inline-flex items-center text-sm text-slate-400 hover:text-surface transition-colors gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </Card>
    </div>
  );
}
