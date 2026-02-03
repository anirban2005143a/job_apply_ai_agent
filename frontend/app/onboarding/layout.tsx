"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  OnboardingProvider,
  useOnboarding,
} from "../../components/OnboardingProvider";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();

  function HeaderControls({ pathProp }: { pathProp?: string }) {
    const router = useRouter();
    const { resumes, ensureResumesProcessed } = useOnboarding();
    const [hasResumes, setHasResumes] = React.useState<boolean>(
      Array.isArray(resumes) && resumes.length > 0,
    );
    const [loading, setLoading] = React.useState<boolean>(false);

    React.useEffect(() => {
      setHasResumes(Array.isArray(resumes) && resumes.length > 0);
    }, [resumes]);

    React.useEffect(() => {
      function read() {
        try {
          const raw = sessionStorage.getItem("onboardingState");
          if (!raw) return setHasResumes(false);
          const parsed = JSON.parse(raw);
          setHasResumes(
            Array.isArray(parsed.resumes) && parsed.resumes.length > 0,
          );
        } catch (e) {
          setHasResumes(false);
        }
      }
      read();
      function onStorage(e: StorageEvent) {
        // Note: sessionStorage changes do not fire storage events across tabs.
        // We still keep this handler as a no-op fallback if localStorage is used elsewhere.
        if (e.key === "onboardingState") read();
      }
      function onResumes() {
        read();
      }
      window.addEventListener("storage", onStorage);
      window.addEventListener(
        "onboarding:resumes-changed",
        onResumes as EventListener,
      );
      return () => {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener(
          "onboarding:resumes-changed",
          onResumes as EventListener,
        );
      };
    }, []);

    async function handleDetailsClick() {
      if (!hasResumes) return;
      setLoading(true);
      try {
        await ensureResumesProcessed();
        router.push("/onboarding/details");
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    return (
      <nav className="flex gap-2 rounded-lg bg-zinc-100/70 dark:bg-zinc-900/70 p-1">
  <Link
    href="/onboarding/upload"
    className={`
      px-4 py-1.5 rounded-md text-sm font-medium transition-colors
      ${pathProp?.includes("upload")
        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
        : "bg-zinc-200 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
      }
    `}
  >
    Upload
  </Link>

  {/*
  <button
    onClick={handleDetailsClick}
    disabled={loading}
    className={`
      px-4 py-1.5 rounded-md text-sm font-medium transition-colors
      ${pathProp?.includes("details")
        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
      }
      disabled:opacity-50 disabled:pointer-events-none
    `}
  >
    {loading ? "Processing..." : "Details"}
  </button>
  */}
</nav>

    );
  }

  return (
    <OnboardingProvider>
  <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-4 pb-8">
    <div className="mx-auto max-w-7xl px-6">

      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Student Onboarding
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Set up your profile to start applying
          </p>
        </div>

        <HeaderControls pathProp={path} />
      </header>

      {/* Main Card */}
      <main
        className="
          rounded-xl border border-zinc-200 dark:border-zinc-800
          bg-white dark:bg-zinc-900
          p-6
        "
      >
        {children}
      </main>
    </div>
  </div>
</OnboardingProvider>

  );
}
