"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/showToast";
import { Eye, EyeOff, Loader, Lock, Mail } from "lucide-react"; // Icons for extra polish
import { ToastContainer } from "react-toastify";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check for server errors passed from middleware
  useEffect(() => {
    const errorType = searchParams.get("error");
    if (errorType === "server_offline") {
      showToast(
        "Authentication server is currently unreachable. Please try later.",
        0,
      );
    }
  }, [searchParams]);

  /**
   * Improved Cookie Helper
   * Setting Max-Age as a number in the string tells the browser exactly
   * when to delete the cookie (it's not just a string, it's a directive).
   */
  function setAuthCookie(name: string, value: string, days = 7) {
    const seconds = days * 24 * 60 * 60;
    // Secure: only sent over HTTPS in production
    const secure = process.env.NODE_ENV === "production" ? "Secure;" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${seconds}; ${secure} SameSite=Lax;`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data?.detail || "Invalid email or password", 0);
        return;
      }
      console.log(data);
      if (data.token) {
        setTimeout(() => {
          setAuthCookie("token", data.token, 7);
        }, 500);
      }
      if (data.user?._id) {
        setTimeout(() => {
          setAuthCookie("user_id", data.user._id, 7);
        }, 500);
      }

      showToast("Welcome back!", 1);

      // Redirect to intended page or home
      const redirectTo = searchParams.get("from") || "/";
      console.log(redirectTo);

      // router.refresh(); // Force middleware to re-evaluate

      setTimeout(() => {
        window.location.href = redirectTo;
      }, 500);
    } catch (err: any) {
      showToast("Logging failed. Please try again.", 0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ToastContainer />
      <div className="relative min-h-screen py-8 w-full flex items-center justify-center overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-500">
        <div className="relative z-10 w-full max-w-md px-6">
          {/* Header Section */}
          <div className="mb-10 text-center">
            {/* <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 dark:bg-zinc-50 shadow-lg">
            <Lock className="h-6 w-6 text-white dark:text-black" />
          </div> */}
            <h1 className="text-4xl font-medium tracking-tight text-gray-700 dark:text-zinc-50">
              Welcome back
            </h1>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to your agent dashboard
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-xl border border-zinc-300/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium  tracking-widest text-zinc-600 dark:text-zinc-300 ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full text-gray-800 dark:text-gray-100 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-10 pr-4 py-2.5 text-sm outline-none ring-zinc-900/5 transition-all focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-4 dark:ring-zinc-100/5"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium  tracking-widest text-zinc-600 dark:text-zinc-300 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full text-gray-800 dark:text-gray-100 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-10 pr-12 py-2.5 text-sm outline-none ring-zinc-900/5 transition-all focus:border-zinc-900 dark:focus:border-zinc-100 focus:ring-4 dark:ring-zinc-100/5"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="mt-2 cursor-pointer disabled:cursor-not-allowed w-full h-12 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all"
              >
                {loading ? (
                  <>
                    <Loader size={10} className="animate-spin " />{" "}
                    Authenticating...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            {/* Footer Link */}
            <div className="mt-8 text-center text-sm font-medium">
              <span className="text-zinc-400 mr-1">No account? </span>
              <Link
                href="/onboarding"
                className="text-zinc-900 text-sm dark:text-zinc-50 underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-current transition-all"
              >
                Create one now
              </Link>
            </div>
          </div>

          {/* Minimalist Sub-footer */}
          <p className="mt-10 text-center text-xs text-zinc-400 dark:text-zinc-600">
            © 2026 Job Apply Agent. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
