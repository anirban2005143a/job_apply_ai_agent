"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Minimal UI imports
import Link from "next/link";
import { Button } from "@/components/ui/button";

// API base (defaults to local backend)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // set cookie helper (7 days expiry)
  function setCookie(name: string, value: string, days = 7) {
    const maxAge = days * 24 * 60 * 60; // seconds
    // Note: HttpOnly cookies must be set from server; this sets client-side cookie as requested
    document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax;`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.detail || data?.message || "Login failed");
        setLoading(false);
        return;
      }

      // store token and user id in cookie with 7 day expiry
      if (data.token) {
        setCookie("token", data.token, 7);
      }
      if (data.user && data.user._id) {
        setCookie("user_id", data.user._id, 7);
      }

      // redirect to home after login
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8">
        <h1 className="mb-6 text-2xl font-semibold">Sign in to your account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-md border px-3 py-2"
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="flex items-center justify-between">
            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <Link href="/onboarding" className="text-sm text-muted-foreground underline">
              Don't have an account? Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
