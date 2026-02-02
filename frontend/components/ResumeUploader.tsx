"use client";

import React, { useCallback, useRef } from "react";
import { useOnboarding } from "./OnboardingProvider";
import ResumeCard from "./ResumeCard";
import { FileText, Upload, X } from "lucide-react";

export default function ResumeUploader() {
  const { resumes, addResumes, removeResume } = useOnboarding();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => {
      // clear input so the same file can be re-selected after removal
      if (inputRef.current) inputRef.current.value = "";
      removeResume(e.detail);
    };
    window.addEventListener("remove-resume", handler as EventListener);
    return () => window.removeEventListener("remove-resume", handler as EventListener);
  }, [removeResume]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).filter((f) => f.type === "application/pdf" || f.name.match(/\.(pdf|docx?|txt)$/i));
    addResumes(arr);
    // clear the input so selecting the same file later still triggers change
    if (inputRef.current) inputRef.current.value = "";
  }, [addResumes]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

 return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
  
  {/* Drop Zone */}
  <div
    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
    onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
    onDragLeave={() => setIsDragOver(false)}
    onDrop={onDrop}
    onClick={() => inputRef.current?.click()}
    className={`
      relative cursor-pointer group
      rounded-2xl border border-dashed
      transition-transform
      flex flex-col items-center justify-center p-12

      ${isDragOver
        ? 'border-zinc-400 dark:border-zinc-600 bg-zinc-100/60 dark:bg-zinc-900/60'
        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-200/40 dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700'
      }
    `}
  >
    <input
      ref={inputRef}
      type="file"
      multiple
      accept=".pdf,.doc,.docx,.txt"
      onChange={(e) => handleFiles(e.target.files)}
      className="hidden"
    />

    {/* Icon */}
    <div className="
      p-4 rounded-full
      bg-white dark:bg-zinc-900
      border border-zinc-200 dark:border-zinc-800
      mb-4
      transition-transform 
      group-hover:scale-105
    ">
      <Upload className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
    </div>

    {/* Text */}
    <div className="text-center">
      <p className="text-base font-medium text-zinc-900 dark:text-zinc-100">
        Click to upload or drag and drop
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
        PDF, DOCX, or TXT (Max 10MB)
      </p>
    </div>

    {/* Soft inner glow on hover */}
    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-zinc-900/5 dark:ring-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
  </div>

  {/* Helper text */}
  <p className="text-xs text-center text-zinc-400 dark:text-zinc-500">
    You can upload multiple documents for different job roles.
  </p>
</div>

  );
}
