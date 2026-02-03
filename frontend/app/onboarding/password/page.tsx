"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/OnboardingProvider";
import { showToast } from "@/lib/showToast";
import { ToastContainer } from "react-toastify";
import { removeEmptyItemsRecursively } from "@/lib/updatePriorities";

export default function PasswordPage() {
  const router = useRouter();
  const { userData, userPreference } = useOnboarding();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();
    if (!trimmed || trimmed.length < 6 || password !== trimmed) {
      showToast("Password must be at least 6 characters and have no leading or trailing spaces.", 0);
      return;
    }
    setLoading(true);
    try {
      // Remove empty items before sending

      // Prefer userPreference saved in sessionStorage (new flow)
      const stored = JSON.parse(sessionStorage.getItem('onboardingState') || '{}');
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
        // fallback for non-JSON error
        result = { error: await res.text() };
      }
      if (res.ok) {
        showToast("Registration successful!", 1);
        await new Promise((r) => setTimeout(r, 1500));
        router.push("/");
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

//   console.log("[PasswordPage] Merged user data on submit:", constraints , userData);
  return (
    <>
      <ToastContainer />
      <div className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-2 text-primary">Create a Password</h1>
          <p className="text-zinc-600 mb-6 text-center text-sm">For your security, please choose a strong password.<br/>It must be at least 6 characters and have no leading or trailing spaces.</p>
          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  className="form-control input-focus w-full pr-12"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={6}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-primary text-lg px-2 focus:outline-none"
                  tabIndex={-1}
                  onClick={() => setShow(s => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.036 3.772 6.017 6.75 9.75 6.75 1.563 0 3.06-.362 4.396-1.027M6.32 6.319C7.81 5.486 9.537 5.25 12 5.25c3.733 0 7.714 2.978 9.75 6.75-.591 1.096-1.37 2.13-2.294 3.02M6.32 6.319l11.36 11.362M6.32 6.319 4.21 4.208m15.58 15.58-2.11-2.11" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12S5.25 5.25 12 5.25 21.75 12 21.75 12 18.75 18.75 12 18.75 2.25 12 2.25 12Zm9.75 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>
                  )}
                </button>
              </div>
              <div className="text-xs text-zinc-500 mt-2">Avoid using common words or personal info for better security.</div>
            </div>
            <button type="submit" className="btn btn-primary w-full flex justify-center items-center cursor-pointer disabled:cursor-not-allowed" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
