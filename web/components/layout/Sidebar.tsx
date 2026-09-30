"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LayoutDashboard, Users, Calendar, Activity, Settings, LogOut, AlertTriangle } from "lucide-react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(auth)/actions";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Sessions", href: "/sessions", icon: Calendar },
  { name: "Progress", href: "/progress", icon: Activity },
];

  export function Sidebar() {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-64 bg-ink-700/30 border-r border-slate-500/20 flex flex-col backdrop-blur-md z-20 relative"
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-500/20">
          <span className="text-surface font-bold tracking-widest uppercase text-sm">FitFlow</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href} className="block relative">
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-accent/10 rounded-lg border border-accent/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'text-accent' : 'text-slate-400 hover:text-surface hover:bg-slate-500/10'}`}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-500/20 space-y-2">
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:text-surface hover:bg-slate-500/10 transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </Link>
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:text-warning hover:bg-warning/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Log out</span>
          </button>
        </div>
      </motion.aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-ink-950 border border-slate-500/30 p-6 rounded-2xl shadow-2xl max-w-sm w-full"
          >
            <div className="flex items-center gap-3 mb-4 text-warning">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold text-surface">Confirm Logout</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              Are you sure you want to log out of your account? You will need to sign in again to access your dashboard.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-500/20 rounded-md transition-colors"
              >
                Cancel
              </button>
              <form action={logoutAction}>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-warning text-ink-950 hover:bg-warning/90 rounded-md transition-colors"
                >
                  Log out
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
