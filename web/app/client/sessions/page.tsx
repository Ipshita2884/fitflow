import { Card } from "@/components/ui/card";
import { Compass, Zap, Activity, Heart, Shield, Dumbbell } from "lucide-react";

export default function ClientSessionsPage() {
  const sessionTypes = [
    {
      title: "Zumba Fat Burn",
      description: "High-intensity dance cardio designed to maximize calorie burn and improve cardiovascular endurance.",
      icon: FlameIcon,
      color: "text-warning",
      bg: "bg-warning/10"
    },
    {
      title: "Strength Zumba",
      description: "A combination of targeted bodyweight exercises mixed into a rhythm-based dance routine for muscle toning.",
      icon: Dumbbell,
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      title: "Dance Cardio",
      description: "Pure dance fitness focusing on complex choreography, rhythm, and continuous movement.",
      icon: Activity,
      color: "text-positive",
      bg: "bg-positive/10"
    },
    {
      title: "Mobility Flow",
      description: "Low-impact recovery sessions to improve joint health, flexibility, and overall mobility.",
      icon: Shield,
      color: "text-slate-300",
      bg: "bg-slate-300/10"
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-surface mb-2 tracking-tight">Explore Sessions</h1>
        <p className="text-slate-500">Discover the different types of training sessions your trainer offers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessionTypes.map((type, i) => (
          <Card key={i} glass className="p-8 flex gap-6 hover:bg-ink-700/40 transition-colors">
            <div className={`w-16 h-16 rounded-xl ${type.bg} flex items-center justify-center shrink-0`}>
              <type.icon className={`w-8 h-8 ${type.color}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-surface mb-2">{type.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{type.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FlameIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
