"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { io, Socket } from "socket.io-client";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [latestToast, setLatestToast] = useState<any>(null);

  useEffect(() => {
    // Initial fetch
    fetch("/api/notifications/unread")
      .then(res => res.json())
      .then(data => {
        setUnreadCount(data.count);
        if (data.count > 0 && data.notifications) {
          setNotifications(data.notifications);
        }
      })
      .catch(console.error);

    // Setup Socket.IO for real-time push instead of short polling
    const newSocket = io();
    newSocket.on("connect", () => {
      fetch("/api/auth/session")
        .then(res => res.json())
        .then(session => {
          if (session?.userId) {
            newSocket.emit("join_user_room", session.userId);
          }
        }).catch(console.error);
    });

    newSocket.on("notification", (notification) => {
      setUnreadCount(prev => prev + 1);
      setLatestToast(notification);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <>
      <div className="relative z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-full hover:bg-slate-500/20 transition-colors text-slate-400 hover:text-surface"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full ring-2 ring-ink-950 animate-pulse"></span>
          )}
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-ink-950 border border-slate-500/30 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-slate-500/20 flex justify-between items-center bg-ink-700/50">
                <h3 className="font-semibold text-surface">Notifications</h3>
                <span className="text-xs text-accent">{unreadCount} New</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    You're all caught up!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-slate-500/10 hover:bg-slate-500/10 transition-colors cursor-pointer">
                      <p className="text-sm font-semibold text-surface">{n.title || "Alert"}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{n.body || n.message}</p>
                      <p className="text-[10px] text-slate-500 mt-2">{new Date(n.createdAt || Date.now()).toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Local Toast Implementation */}
      <AnimatePresence>
        {showToast && latestToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 bg-ink-950 border border-slate-500/30 text-surface p-4 rounded-xl shadow-2xl flex items-start gap-4 z-50 max-w-sm"
          >
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h4 className="font-bold text-sm">New Notification</h4>
              <p className="text-slate-400 text-sm mt-1">{latestToast.message || latestToast.body}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
