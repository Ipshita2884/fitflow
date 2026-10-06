"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useActionState, useState } from "react";
import { signupAction } from "../actions";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [state, action, isPending] = useActionState(signupAction, undefined);
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

  return (
    <div className="w-full max-w-md my-8">
      <Card glass className="p-8 shadow-2xl border-slate-500/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Create Account</h1>
          <p className="text-slate-500 text-sm">Join FitFlow to transform your fitness journey.</p>
        </div>

        <form action={action} className="space-y-5">
          {state?.error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {state.error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium text-slate-200">Full Name</label>
            <input 
              id="fullName"
              name="fullName"
              type="text" 
              required
              className="w-full h-11 px-4 rounded-md bg-ink-950 border border-slate-500/30 text-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300" 
              placeholder="John Doe" 
            />
          </div>

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

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-200">Password</label>
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

            {/* Password strength meter */}
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

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-slate-200">Role</label>
            <select 
              id="role"
              name="role"
              required
              className="w-full h-11 px-4 rounded-md bg-ink-950 border border-slate-500/30 text-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300 appearance-none"
            >
              <option value="CLIENT">Client</option>
              <option value="TRAINER">Trainer</option>
            </select>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input 
              id="termsAccepted"
              name="termsAccepted"
              type="checkbox"
              required
              className="mt-1 w-4 h-4 accent-accent rounded border-slate-500/30 bg-ink-950"
            />
            <label htmlFor="termsAccepted" className="text-xs text-slate-400 leading-normal">
              I agree to the <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          <Button type="submit" variant="accent" className="w-full mt-2" disabled={isPending}>
            {isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="text-accent hover:underline">Sign in</Link>
        </div>
      </Card>
    </div>
  );

}
