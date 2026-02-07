"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  XCircle,
  HelpCircle,
  CheckCircle2,
  Cone,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { showToast } from "@/lib/showToast";

interface Notification {
  id?: number;
  type: "applied" | "rejected" | "clarify";
  message: string;
  job_id?: number | String;
}

export function NotificationMenu({ userId }: { userId: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    // {
    //   type: "applied",
    //   message: "your job has been applied",
    //   job_id: "job_103",
    // },
    // {
    //   type: "rejected",
    //   message: "your job has been rejected",
    //   job_id: "job_402",
    // },
    // {
    //   type: "clarify",
    //   message: "your job has been clarify",
    //   job_id: "job_401",
    // },
  ]);
  const [hasUnread, setHasUnread] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const socketRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playNotificationSound = () => {
    try {
      const AudioCtxCtor: any =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxCtor) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtxCtor();
      const ctx = audioCtxRef.current as AudioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.error("playNotificationSound failed", e);
    }
  };

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
      playNotificationSound();
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
          color: "text-green-500",
          bg: "bg-green-50 dark:bg-green-950/30",
          path: "/applied-jobs",
        };
      case "rejected":
        return {
          icon: <XCircle size={14} />,
          color: "text-red-500",
          bg: "bg-red-50 dark:bg-red-950/30",
          path: "/discard-jobs",
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

  // close the notification menu when click outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      setIsOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition-all hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
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
                      className="flex w-full items-start justify-between gap-3 border-b border-zinc-50 p-4 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-900/50 dark:hover:bg-zinc-900/40"
                    >
                      <div className=" flex items-center gap-2">
                        <span
                          className={` flex items-center justify-center rounded-md ${style.color}`}
                        >
                          {style.icon}
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-200 leading-tight">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-semibold uppercase">
                            {n.type}
                          </p>
                        </div>
                      </div>

                      <div className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/50 cursor-pointer p-1 hover:bg-slate-300/50 transition-all">
                        <ChevronRight
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`${style.path}#${n.job_id}`);
                          }}
                          size={20} // size in pixels
                          className="text-gray-400 dark:text-gray-500"
                        />
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
