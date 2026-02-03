"use client";

import React, { useEffect, useState } from "react";
import { useOnboarding } from "@/components/OnboardingProvider";
import EditableJsonForm from "@/components/EditableJsonForm";
import demoUser from "@/data/demoUser";
import { useRouter } from "next/navigation";
import { applyPrioritiesRecursively } from "../../../lib/updatePriorities";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function DetailsContent() {
  const router = useRouter();
  const { userData, setUserData } = useOnboarding();
  const [showJson, setShowJson] = useState(false);

  // initialize provider userData with demo if not present (run once)
  useEffect(() => {
    function ensureCoreFields(obj: any) {
      const out = { ...obj };
      const core = [
        "full_name",
        "email",
        "phone",
        "linkedin_url",
        "github_url",
        "portfolio_url",
      ];
      for (const k of core) {
        if (!(k in out)) out[k] = "";
      }
      return out;
    }

    if (!userData) {
      // Strip any existing 'id' fields from demo data so ids are never shown or stored in UI
      function stripIds(obj: any): any {
        if (Array.isArray(obj)) return obj.map((v) => stripIds(v));
        if (obj && typeof obj === "object") {
          const out: any = {};
          for (const k of Object.keys(obj)) {
            if (k === "id") continue;
            out[k] = stripIds(obj[k]);
          }
          return out;
        }
        return obj;
      }
      const cleaned = stripIds(demoUser);

      // remove empty items (fixes the 'extra blank items' issue)
      const {
        removeEmptyItemsRecursively,
      } = require("../../../lib/updatePriorities");
      const cleaned2 = removeEmptyItemsRecursively(cleaned);

      const withPriority = applyPrioritiesRecursively(
        ensureCoreFields(cleaned2),
      );
      setUserData(withPriority);
    }
    // only set initial data if not present — don't overwrite existing provider state
  }, []);

  if (!userData) return <div className="p-8">Loading...</div>;

  return (
    <div
      className="
    min-h-screen
    bg-gradient-to-b from-zinc-50 to-white
    dark:from-zinc-950 dark:to-zinc-900
    px-6 py-8
  "
    >
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Edit your profile
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Review and refine your information before proceeding
        </p>
      </div>

      {/* Form Container */}
      <div
        className="
      max-w-6xl
      rounded-2xl
      border border-zinc-200 dark:border-zinc-800
      bg-white dark:bg-zinc-950
      p-6
      shadow-sm
    "
      >
        <EditableJsonForm
          data={userData}
          onChange={(d: any) => setUserData(d)}
        />
      </div>

      {/* Action Bar */}
      <div
        className="
      mt-8 flex flex-wrap gap-3
      items-center
      justify-between
    "
      >
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/onboarding/upload")}
            className="
          rounded-lg
          border border-zinc-300 dark:border-zinc-700
          bg-white dark:bg-zinc-900
          px-4 py-2 text-sm
          text-zinc-700 dark:text-zinc-300
          transition-all
          hover:bg-zinc-100 dark:hover:bg-zinc-800
        "
          >
            Back
          </button>

          <button
            onClick={() => setShowJson((s) => !s)}
            className="
          rounded-lg
          border border-zinc-300 dark:border-zinc-700
          bg-white dark:bg-zinc-900
          px-4 py-2 text-sm
          text-zinc-700 dark:text-zinc-300
          transition-all
          hover:bg-zinc-100 dark:hover:bg-zinc-800
        "
          >
            {showJson ? "Hide JSON" : "Preview JSON"}
          </button>
        </div>

        <button
          onClick={() => {
            const missing: string[] = [];
            if (!userData?.full_name?.trim()) missing.push("Full name");
            if (!userData?.email?.trim()) missing.push("Email");
            if (!userData?.phone?.trim()) missing.push("Phone");
            const hasAnyLink = [
              userData?.linkedin_url,
              userData?.github_url,
              userData?.portfolio_url,
            ].some((v) => v && v.trim());
            if (!hasAnyLink)
              missing.push("At least one of LinkedIn, GitHub, or Portfolio");

            if (missing.length > 0) {
              toast.error("Please fill in: " + missing.join(", "));
              return;
            }

            const {
              removeEmptyItemsRecursively,
            } = require("../../../lib/updatePriorities");
            const cleaned = removeEmptyItemsRecursively(userData);
            console.log("[DetailsPage] Final user data on Save:", cleaned);
            toast.success("Profile saved. Proceeding to preferences...");
            setTimeout(() => {
              router.push("/onboarding/preferences");
            }, 800);
          }}
          className="
            rounded-lg cursor-pointer
            bg-primary
            px-6 py-2
            text-sm font-medium
            text-white
            dark:text-gray-100
            shadow-sm
            transition-all
            hover:bg-primary/90
            focus:outline-none
            focus:ring-2 focus:ring-primary/40
          "
        >
          Save
        </button>
      </div>

      {/* JSON Preview */}
      {showJson ? (
        <div
          className="
        mt-6
        rounded-xl
        border border-zinc-200 dark:border-zinc-800
        bg-zinc-50 dark:bg-zinc-900
        p-4
      "
        >
          <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            JSON Preview
          </h3>
          <pre
            className="
          max-h-64 overflow-auto
          rounded-lg
          bg-black/5 dark:bg-black/30
          p-3
          text-xs
          text-zinc-800 dark:text-zinc-200
        "
          >
            {JSON.stringify(
              (function stripFields(obj: any): any {
                if (Array.isArray(obj)) return obj.map((v) => stripFields(v));
                if (obj && typeof obj === "object") {
                  const out: any = {};
                  for (const k of Object.keys(obj)) {
                    if (k === "id" || k === "priority") continue;
                    out[k] = stripFields(obj[k]);
                  }
                  return out;
                }
                return obj;
              })(userData),
              null,
              2,
            )}
          </pre>
        </div>
      ) : null}

      <ToastContainer
        position="top-right"
        autoClose={2400}
        hideProgressBar
        closeOnClick
        pauseOnHover
      />
    </div>
  );
}

export default function DetailsPage() {
  return <DetailsContent />;
}
