"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/OnboardingProvider";
import ResumeUploader from "@/components/ResumeUploader";
import ResumeCard from "@/components/ResumeCard";
import { Loader } from "lucide-react";
import { showToast } from "@/lib/showToast";
import { ToastContainer } from "react-toastify";

function UploadPageContent() {
  const router = useRouter();
  const { resumes, ensureResumesProcessed } = useOnboarding();
  const [loading, setLoading] = useState(false);

  async function handleNext() {
    if (resumes?.length === 0) return;
    setLoading(true);
    try {
      // ensure any new resumes are processed (calls backend /parse-resumes)
      const result = await ensureResumesProcessed();
      if (result.processed) {
        // if API returned user data, provider already stored it and persisted to localStorage
        router.push("/onboarding/details");
      } else {
        // show generic error
        showToast(
          "Resumes could not be processed. Check logs or try again.",
          0,
        );
        console.error("Resumes could not be processed");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 md:p-8 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
      <div className="mx-auto max-w-6xl mb-5">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              Upload your resume
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Upload one or more resumes. You can add more later.
            </p>
          </div>

          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {resumes?.length ?? 0} uploaded
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left: uploader */}
          <div className="space-y-4">
            <ResumeUploader />

            <div className="flex items-center gap-3">
              <button
                onClick={() => document.getElementById("resume-input")?.click()}
                className="
              rounded-lg border border-zinc-200 dark:border-zinc-800
              bg-white dark:bg-zinc-900 cursor-pointer
              px-4 py-2 text-sm font-medium
              text-zinc-800 dark:text-zinc-200
              hover:bg-zinc-100 dark:hover:bg-zinc-800
              transition-colors
            "
              >
                Add another
              </button>

              <button
                onClick={() => {
                  if (resumes?.length === 0) return;
                  handleNext();
                }}
                disabled={resumes?.length === 0 || loading}
                className="
              ml-auto rounded-lg cursor-pointer
              bg-zinc-800 dark:bg-zinc-100
              px-5 py-2 text-sm font-medium
              text-white dark:text-zinc-900
              hover:bg-zinc-950 dark:hover:bg-zinc-200
              disabled:opacity-50 disabled:pointer-events-none
              transition-colors disabled:cursor-not-allowed
            "
              >
                {loading ? <>
                <Loader size={20} className=" animate-spin mr-2 inline-block"/> Processing...
                </> : "Next"}
              </button>
            </div>
          </div>

          {/* Right: uploaded list */}
          <div
            className="
              rounded-xl border border-zinc-200 dark:border-zinc-800
              bg-white dark:bg-zinc-900
              p-4
            "
          >
            <div className="mb-3 p-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Uploaded resumes
            </div>

            <div className="space-y-2 max-h-full min-h-10 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
              {!resumes && (
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Loader size={18} className="animate-spin" />
                  <span>Checking</span>
                </div>
              )}

              {resumes?.length === 0 && (
                <div className="text-base text-zinc-500 p-2 dark:text-zinc-400">
                  No resumes yet. Upload one to continue.
                </div>
              )}

              {resumes?.map((r) => (
                <ResumeCard
                  key={r.id}
                  resume={r}
                  onRemove={() => {
                    const ev = new CustomEvent("remove-resume", {
                      detail: r.id,
                    });
                    window.dispatchEvent(ev);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <>
      <ToastContainer />
      <UploadPageContent />
    </>
  );
}
