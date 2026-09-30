import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Activity, Users, Calendar } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-ink-950 to-ink-950 pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5 text-accent text-sm font-medium tracking-wide mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            FitFlow 2.0 is Here
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-surface">
            Elevate Your <span className="text-accent">Fitness Business</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed">
            The premium management platform for professional trainers. Automate bookings, track client progress, and grow your business with a stunning, modern experience.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/signup">
              <Button variant="accent" size="lg" className="w-full sm:w-auto gap-2">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Log In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 px-6 relative z-10 bg-ink-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-surface">Everything you need</h2>
            <p className="text-slate-500">Designed to be powerful, yet incredibly simple to use.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card glass className="flex flex-col items-center text-center p-8">
              <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-6">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-surface">Smart Booking</h3>
              <p className="text-slate-500">
                Effortlessly manage your sessions. Let clients book open slots based on your real-time availability.
              </p>
            </Card>

            <Card glass className="flex flex-col items-center text-center p-8">
              <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-6">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-surface">Progress Tracking</h3>
              <p className="text-slate-500">
                Visualize client growth with beautiful charts and automated milestones that keep motivation high.
              </p>
            </Card>

            <Card glass className="flex flex-col items-center text-center p-8">
              <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-surface">Client Management</h3>
              <p className="text-slate-500">
                All client data, assessments, and communication in one beautiful, highly organized dashboard.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
