"use client";

import { FileText, Trash2, FileCheck } from "lucide-react";

export default function ResumeCard({ resume, onRemove }: { resume: { id: string; name: string; size: number }; onRemove: () => void }) {
  
  // Format file size for a cleaner look
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };
  
  return (
    

    <div className="group relative flex items-center justify-between p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
  
  {/* Left section */}
  <div className="flex items-center gap-4 min-w-0">
    
    {/* Icon */}
    <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/60">
      <FileText className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
    </div>

    {/* File info */}
    <div className="min-w-0">
      <h4
        className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px] sm:max-w-[280px] md:max-w-md"
        title={resume.name}
      >
        {resume.name}
      </h4>

      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-zinc-500 font-medium">
          {formatSize(resume.size)}
        </span>

        <span className="text-[10px] text-zinc-300 dark:text-zinc-700">•</span>

        {/* Status pill */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <FileCheck className="w-3 h-3" />
          Ready
        </span>
      </div>
    </div>
  </div>

  {/* Right actions */}
  <div className="flex items-center ml-4">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className="relative p-2.5 cursor-pointer rounded-full bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
      title="Remove document"
      aria-label="Remove resume"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>

  {/* Hover accent bar */}
  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
</div>

  );
}
