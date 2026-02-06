"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, XCircle, HelpCircle, CheckCircle2, Cone } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { showToast } from "@/lib/showToast";

interface Notification {
  id: number;
  type: "applied" | "rejected" | "clarify";
  message: string;
}

export function NotificationMenu({ userId }: { userId: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const socketRef = useRef<WebSocket | null>(null);

  // 1. WebSocket Connection Logic
  useEffect(() => {
    if (!userId) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;

    const wsUrl = backendUrl.startsWith("https")
      ? backendUrl.replace("https", "wss")
      : backendUrl.replace("http", "ws");

    const socket = new WebSocket(`${wsUrl}/ws/${userId}`);

    console.log("socket connected", socket);
    socketRef.current = socket;

    socket.onopen = () => console.log("WebSocket connected");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => [
        { id: Date.now(), type: data.type, message: data.message },
        ...prev,
      ]);
      setHasUnread(true);
    };

    socket.onerror = () => {
      console.log("Socket connection failed");
      showToast("Socket connection failed. Please refresh once", 0);
    };

    return () => socket.close();
  }, [userId]);

  // 2. Clear badge when menu opens
  useEffect(() => {
    if (isOpen && hasUnread) {
      setHasUnread(false);
    }
  }, [isOpen, hasUnread]);

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "applied":
        return {
          icon: <CheckCircle2 size={14} />,
          color: "text-blue-500",
          bg: "bg-blue-50 dark:bg-blue-950/30",
          path: "/applied-jobs",
        };
      case "rejected":
        return {
          icon: <XCircle size={14} />,
          color: "text-red-500",
          bg: "bg-red-50 dark:bg-red-950/30",
          path: "/rejected-jobs",
        };
      case "clarify":
        return {
          icon: <HelpCircle size={14} />,
          color: "text-amber-500",
          bg: "bg-amber-50 dark:bg-amber-950/30",
          path: "/clarify-jobs",
        };
      default:
        return {
          icon: <Bell size={14} />,
          color: "text-zinc-500",
          bg: "bg-zinc-50",
          path: "/",
        };
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-all hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
      >
        <Bell size={18} />
        {/* The Blue Dot Badge */}
        {hasUnread && (
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-[#050505]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-900">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
                Activity Stream
              </h3>
            </div>

            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => {
                  const style = getTypeStyles(n.type);
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        router.push(style.path);
                        setIsOpen(false);
                      }}
                      className="flex w-full items-start gap-3 border-b border-zinc-50 p-4 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-900/50 dark:hover:bg-zinc-900/40"
                    >
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${style.bg} ${style.color}`}
                      >
                        {style.icon}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-200 leading-tight">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-semibold uppercase">
                          {n.type}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-12 text-center text-[12px] text-zinc-500 italic">
                  Waiting for new updates...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
