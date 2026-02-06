"use client";

import React, { useEffect, useState } from "react";
import { useOnboarding } from "@/components/OnboardingProvider";
import EditableJsonForm from "@/components/EditableJsonForm";
import { useRouter } from "next/navigation";
import {
  applyPrioritiesRecursively,
  removeEmptyItemsRecursively,
} from "../../../lib/updatePriorities";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "@/lib/showToast";

function DetailsContent() {
  const router = useRouter();
  const { userData, setUserData } = useOnboarding();
  const [showJson, setShowJson] = useState(false);

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center  bg-zinc-100  dark:bg-zinc-950 rounded-xl px-6 py-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Simple CSS Spinner */}
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-primary dark:border-zinc-800" />
          <div className="text-center">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Loading profile
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Preparing your data for editing...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (userData == -1) {
    return (
      <div className="flex flex-col items-center justify-center bg-zinc-100  dark:bg-zinc-950 rounded-xl px-6 py-8">
        <div className="max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            User data not found
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            We couldn't retrieve your profile information. Please try uploading
            your resume again.
          </p>
          <button
            onClick={() => router.push("/onboarding/upload")}
            className="mt-6 w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Return to Upload
          </button>
        </div>
      </div>
    );
  }

  console.log(userData);

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
          rounded-lg cursor-pointer
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
          rounded-lg cursor-pointer
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
              showToast("Please fill in: " + missing.join(", "), 0);
              return;
            }

            const cleaned = removeEmptyItemsRecursively(userData);
            console.log("[DetailsPage] Final user data on Save:", cleaned);
            showToast("Profile saved. Proceeding to preferences...", 1);
            setTimeout(() => {
              router.push("/onboarding/preferences");
            }, 800);
          }}
          className="
            rounded-lg cursor-pointer
            bg-blue-600 text-white hover:bg-blue-700 transition
            px-6 py-2
            text-sm font-medium
            dark:text-gray-100
            shadow-sm
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

      <ToastContainer />
    </div>
  );
}

export default function DetailsPage() {
  return <DetailsContent />;
}
