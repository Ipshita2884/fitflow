"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Activity, Target, Calendar, BarChart3, MessageSquare, Lock } from "lucide-react";
import { motion } from "framer-motion";

export function ClientTabsNavigation({ clientId }: { clientId: string }) {
  const pathname = usePathname();
  const basePath = `/clients/${clientId}`;

  const tabs = [
    { name: "Overview", href: `${basePath}`, icon: LayoutDashboard },
    { name: "Measurements", href: `${basePath}/measurements`, icon: Activity },
    { name: "Goals", href: `${basePath}/goals`, icon: Target },
    { name: "Schedule", href: `${basePath}/schedule`, icon: Calendar },
    { name: "Analytics", href: `${basePath}/analytics`, icon: BarChart3 },
    { name: "Messages", href: `${basePath}/chat`, icon: MessageSquare },
    { name: "Private Notes", href: `${basePath}/notes`, icon: Lock },
  ];

  return (
    <nav className="w-full lg:w-64 shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link key={tab.name} href={tab.href} className="relative block shrink-0">
            {isActive && (
              <motion.div 
                layoutId="client-tab-active"
                className="absolute inset-0 bg-ink-800 rounded-lg border border-slate-500/20 shadow-sm"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <div className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${isActive ? 'text-surface font-semibold' : 'text-slate-400 hover:text-surface hover:bg-slate-500/10'}`}>
              <tab.icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
              <span className="text-sm">{tab.name}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
