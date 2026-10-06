"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction } from "../actions";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [state, action, isPending] = useActionState(loginAction, undefined);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md">
      <Card glass className="p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 text-sm">Enter your credentials to access your dashboard.</p>
        </div>

        <form action={action} className="space-y-6">
          {state?.error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Email Address</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full h-11 px-4 rounded-md bg-ink-950 border border-slate-500/30 text-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300" 
              placeholder="you@example.com" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-200">Password</label>
              <Link href="#" className="text-xs text-accent hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input 
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full h-11 pl-4 pr-10 rounded-md bg-ink-950 border border-slate-500/30 text-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300" 
                placeholder="••••••••" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-surface transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="accent" className="w-full" disabled={isPending}>
            {isPending ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Don't have an account? <Link href="/signup" className="text-accent hover:underline">Sign up</Link>
        </div>
      </Card>
    </div>
  );
}
