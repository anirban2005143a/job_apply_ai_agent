"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/OnboardingProvider";
import { showToast } from "@/lib/showToast";
import { ToastContainer } from "react-toastify";
import { removeEmptyItemsRecursively } from "@/lib/updatePriorities";
import {
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  Loader2,
  Shield,
  CheckCircle,
} from "lucide-react";

export default function PasswordPage() {
  const router = useRouter();
  const { userData, userPreference } = useOnboarding();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  function setAuthCookie(name: string, value: string, days = 7) {
    const seconds = days * 24 * 60 * 60;
    // Secure: only sent over HTTPS in production
    const secure = process.env.NODE_ENV === "production" ? "Secure;" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${seconds}; ${secure} SameSite=Lax;`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();
    if (!trimmed || trimmed.length < 6 || password !== trimmed) {
      showToast(
        "Password must be at least 6 characters and have no leading or trailing spaces.",
        0,
      );
      return;
    }

    if (!userData || (Array.isArray(userData) && userData.length == 0)) {
      showToast("User Data not found", 0);
      return;
    }

    setLoading(true);
    try {
      const stored = JSON.parse(
        sessionStorage.getItem("onboardingState") || "{}",
      );
      const prefs = stored.userPreference || userPreference || {};
      const merged = { ...prefs, ...userData };
      const cleaned = removeEmptyItemsRecursively(merged);
      function stripInternal(o: any): any {
        if (Array.isArray(o)) return o.map((v) => stripInternal(v));
        if (o && typeof o === "object") {
          const out: any = {};
          for (const k of Object.keys(o)) {
            if (k.startsWith("_")) continue;
            out[k] = stripInternal(o[k]);
          }
          return out;
        }
        return o;
      }
      const cleanedUserData = stripInternal(cleaned);

      const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/register`;
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: cleanedUserData, password }),
      });
      let result: any = {};
      try {
        result = await res.json();
      } catch (e) {
        result = { error: await res.text() };
      }
      if (res.ok) {
        showToast("Registration successful!", 1);
        sessionStorage.clear();
        if (result.token) {
          await new Promise((res, rej) => {
            setTimeout(() => {
              setAuthCookie("token", result.token, 7);
              res(true);
            }, 300);
          });
        }
        if (result.user?._id) {
          await new Promise((res, rej) => {
            setTimeout(() => {
              setAuthCookie("user_id", result.user._id, 7);
              res(true);
            }, 300);
          });
        }
        window.location.href = "/"
      } else {
        showToast(
          result.detail ||
            result.error ||
            result.message ||
            "Registration failed.",
          0,
        );
      }
    } catch (err) {
      showToast("Error: " + (err as any)?.message, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-linear-to-br from-gray-50 via-white to-gray-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
        <div className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] p-10 flex flex-col items-center border border-gray-200/70 dark:border-gray-800 backdrop-blur-sm">
          {/* Icon Header */}
          <div className="mb-8 bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-2xl shadow-sm">
            <Lock
              className="w-10 h-10 text-blue-700 dark:text-blue-400"
              strokeWidth={2}
            />
          </div>

          {/* Typography */}
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white tracking-tight text-center">
            Secure Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-10 text-center text-base leading-relaxed max-w-sm">
            Create a strong password to protect your personal information and
            ensure account security.
          </p>

          <form className="w-full space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  className="w-full px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 dark:focus:border-blue-500 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-500 font-normal"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors p-2 cursor-pointer "
                  tabIndex={-1}
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex items-start gap-2 pt-2">
                <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Minimum 6 characters • No leading or trailing spaces • Avoid
                  common words
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 bg-linear-to-r from-blue-700 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-800 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 flex justify-center items-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-3 h-5 w-5" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Complete Registration
                </>
              )}
            </button>
          </form>

          {/* Legal Text */}
          <p className="mt-10 text-xs text-gray-500 dark:text-gray-500 text-center max-w-sm leading-relaxed border-t border-gray-200 dark:border-gray-800 pt-6">
            By registering, you agree to our{" "}
            <a
              href="#"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mt-8 text-sm cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex items-center gap-2 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Go back
        </button>
      </div>
    </>
  );
}
